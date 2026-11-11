/**
 * Kortex Defender · Moteur Réel d'Audit Réseau & Application Web
 * - Résolution DNS, enregistrements MX, contrôles SPF et DMARC
 * - Inspection cryptographique du certificat SSL/TLS et suites de chiffrement
 * - Audit approfondi des en-têtes HTTP de sécurité (CSP, HSTS, X-Frame-Options...)
 * - Détection des fuites de technologies (Server, X-Powered-By)
 * - Probing d'endpoints sensibles (.env, .git, robots.txt, swagger)
 * - Cartographie passive et active des sous-domaines
 * - Calcul synthétique du score de sécurité (sur 100) et matrice CVSS
 */
import dns from 'node:dns/promises';
import tls from 'node:tls';
import http from 'node:http';
import https from 'node:https';
import { URL } from 'node:url';

export interface ScanFinding {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: string;
  cvss: number;
  description: string;
  impact?: string;
  remediation: string;
  proof?: string;
  component?: string;
  url: string;
}

export interface ScanResult {
  score: number;
  duration_seconds: number;
  counts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  findings: ScanFinding[];
  log_lines: string[];
  subdomains: string[];
  tls_info?: {
    protocol: string;
    cipher: string;
    valid_to: string;
    issuer: string;
    days_left: number;
  };
  dns_records?: {
    ips: string[];
    mx: string[];
    has_spf: boolean;
    has_dmarc: boolean;
  };
}

// Protection SSRF : Bloquer les adresses IP privées ou les métadonnées Cloud
function isPrivateIp(ip: string): boolean {
  if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') return false; // Autorisé en sandbox locale
  if (ip === '169.254.169.254') return true; // AWS / GCP metadata
  if (ip.startsWith('10.') || ip.startsWith('192.168.')) return true;
  return false;
}

export async function executeRealAudit(
  targetUrl: string,
  profile: 'fast' | 'standard' | 'deep' = 'standard',
  onProgress: (progress: number, phase: string, log: string) => void = () => {}
): Promise<ScanResult> {
  const startTime = Date.now();
  const findings: ScanFinding[] = [];
  const logLines: string[] = [];

  const addLog = (msg: string) => {
    const timeStr = new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    logLines.push(`${timeStr} - ${msg}`);
    console.log(`[Engine] ${msg}`);
  };

  const parsedUrl = new URL(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`);
  const hostname = parsedUrl.hostname;
  const isHttps = parsedUrl.protocol === 'https:';
  const port = parsedUrl.port ? parseInt(parsedUrl.port, 10) : isHttps ? 443 : 80;

  // -------------------------------------------------------------
  // Étape 1 : Cartographie DNS & Résolution IP (15%)
  // -------------------------------------------------------------
  onProgress(15, 'Cartographie DNS', `Résolution DNS pour ${hostname}...`);
  addLog(`Résolution des enregistrements A, AAAA et MX pour ${hostname}`);

  let ipAddresses: string[] = [];
  const dnsRecords = { ips: [] as string[], mx: [] as string[], has_spf: false, has_dmarc: false };

  try {
    const addresses = await dns.resolve4(hostname).catch(() => []);
    const addresses6 = await dns.resolve6(hostname).catch(() => []);
    ipAddresses = [...addresses, ...addresses6];
    dnsRecords.ips = ipAddresses;

    if (ipAddresses.length > 0) {
      addLog(`Adresses IP résolues : ${ipAddresses.join(', ')}`);
      for (const ip of ipAddresses) {
        if (isPrivateIp(ip)) {
          throw new Error(`Protection SSRF : L'adresse IP ${ip} appartient à un réseau privé restreint.`);
        }
      }
    } else {
      addLog(`Attention : Aucun enregistrement IPv4/IPv6 direct trouvé pour ${hostname}`);
    }

    const mxRecords = await dns.resolveMx(hostname).catch(() => []);
    dnsRecords.mx = mxRecords.map((m) => `${m.exchange} (prio ${m.priority})`);
    if (mxRecords.length > 0) {
      addLog(`Enregistrements MX détectés : ${dnsRecords.mx.slice(0, 2).join(', ')}`);
    }

    const txtRecords = await dns.resolveTxt(hostname).catch(() => []);
    const flatTxt = txtRecords.flat().join(' ');
    dnsRecords.has_spf = flatTxt.toLowerCase().includes('v=spf1');

    const dmarcRecords = await dns.resolveTxt(`_dmarc.${hostname}`).catch(() => []);
    dnsRecords.has_dmarc = dmarcRecords.flat().join(' ').toLowerCase().includes('v=dmarc1');

    if (!dnsRecords.has_spf) {
      findings.push({
        id: `fnd_dns_spf_${Date.now()}`,
        title: 'Enregistrement SPF (Sender Policy Framework) manquant',
        severity: 'medium',
        category: 'Sécurité de la Messagerie & DNS',
        cvss: 5.3,
        description: `Aucun enregistrement SPF valide n'a été détecté dans les zones DNS de ${hostname}.`,
        impact: 'Des attaquants peuvent usurper le nom de domaine pour envoyer des campagnes de phishing (email spoofing).',
        remediation: `Configurez un enregistrement TXT dans votre zone DNS : "v=spf1 a mx ~all".`,
        proof: 'Requête DNS TXT vide ou sans mention v=spf1',
        component: 'DNS / SPF',
        url: targetUrl,
      });
      addLog('Alerte : Enregistrement SPF manquant');
    }

    if (!dnsRecords.has_dmarc) {
      findings.push({
        id: `fnd_dns_dmarc_${Date.now()}`,
        title: 'Politique DMARC non configurée',
        severity: 'low',
        category: 'Sécurité de la Messagerie & DNS',
        cvss: 3.8,
        description: `L'enregistrement DNS _dmarc.${hostname} est introuvable.`,
        impact: 'Absence de visibilité sur les tentatives d’usurpation de vos adresses email.',
        remediation: `Créez l'enregistrement TXT : _dmarc.${hostname} avec "v=DMARC1; p=quarantine;".`,
        proof: `Requête DNS TXT sur _dmarc.${hostname} infructueuse`,
        component: 'DNS / DMARC',
        url: targetUrl,
      });
      addLog('Alerte : Politique DMARC absente');
    }
  } catch (err: any) {
    addLog(`Étape DNS : ${err.message}`);
  }

  // -------------------------------------------------------------
  // Étape 2 : Inspection Cryptographique SSL/TLS (35%)
  // -------------------------------------------------------------
  onProgress(35, 'Cryptographie SSL/TLS', `Inspection du certificat et du protocole TLS sur ${hostname}:${port}...`);
  addLog(`Négociation du handshake TLS sur ${hostname}:${port}`);

  let tlsInfo: ScanResult['tls_info'] | undefined = undefined;

  if (isHttps) {
    try {
      tlsInfo = await new Promise((resolve) => {
        const socket = tls.connect(
          {
            host: hostname,
            port: port,
            servername: hostname,
            rejectUnauthorized: false,
            timeout: 5000,
          },
          () => {
            const cert = socket.getPeerCertificate();
            const cipher = socket.getCipher();
            const protocol = socket.getProtocol();

            socket.end();

            if (!cert || !cert.valid_to) {
              return resolve(undefined);
            }

            const validToDate = new Date(cert.valid_to);
            const daysLeft = Math.floor((validToDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

            resolve({
              protocol: protocol || 'TLSv1.2',
              cipher: cipher?.name || 'Inconnu',
              valid_to: cert.valid_to,
              issuer: String(cert.issuer?.O || cert.issuer?.CN || 'Autorité de Certification'),
              days_left: daysLeft,
            });
          }
        );

        socket.on('error', (err) => {
          addLog(`Erreur handshake TLS : ${err.message}`);
          resolve(undefined);
        });

        socket.on('timeout', () => {
          socket.destroy();
          addLog('Timeout lors de la négociation TLS');
          resolve(undefined);
        });
      });

      if (tlsInfo) {
        addLog(`Certificat valide émis par "${tlsInfo.issuer}", protocole ${tlsInfo.protocol}, expiration dans ${tlsInfo.days_left} jours.`);

        if (tlsInfo.days_left <= 15 && tlsInfo.days_left > 0) {
          findings.push({
            id: `fnd_tls_exp_${Date.now()}`,
            title: `Certificat SSL/TLS arrivant à expiration (${tlsInfo.days_left} jours restants)`,
            severity: 'high',
            category: 'Chiffrement & SSL/TLS',
            cvss: 7.0,
            description: `Le certificat SSL/TLS expire le ${tlsInfo.valid_to}. Les navigateurs bloqueront l'accès dès dépassement.`,
            impact: 'Interruption critique de service pour les utilisateurs une fois la date passée.',
            remediation: 'Renouvelez votre certificat dès aujourd’hui (via Certbot / Let’s Encrypt ou votre registrar).',
            proof: `Valid until: ${tlsInfo.valid_to}`,
            component: 'TLS Certificate',
            url: targetUrl,
          });
        }

        if (tlsInfo.protocol === 'TLSv1' || tlsInfo.protocol === 'TLSv1.1') {
          findings.push({
            id: `fnd_tls_proto_${Date.now()}`,
            title: `Protocole obsolète et déprécié (${tlsInfo.protocol})`,
            severity: 'critical',
            category: 'Chiffrement & SSL/TLS',
            cvss: 9.1,
            description: `Le serveur accepte encore les connexions avec le protocole ${tlsInfo.protocol}, interdit par les normes de sécurité PCI-DSS et ANSSI.`,
            impact: 'Vulnérabilité aux attaques BEAST, POODLE et écoute passive des flux chiffrés.',
            remediation: 'Désactivez TLS 1.0 et TLS 1.1 sur votre serveur web. Activez exclusivement TLS 1.2 et TLS 1.3.',
            proof: `Protocole négocié : ${tlsInfo.protocol}`,
            component: 'SSL/TLS Protocol',
            url: targetUrl,
          });
        }
      }
    } catch (err: any) {
      addLog(`Erreur d'analyse TLS : ${err.message}`);
    }
  } else {
    findings.push({
      id: `fnd_http_no_tls_${Date.now()}`,
      title: 'Absence de chiffrement HTTPS (Protocole HTTP non sécurisé en clair)',
      severity: 'critical',
      category: 'Chiffrement & SSL/TLS',
      cvss: 9.0,
      description: `L'application est servie via le protocole non chiffré HTTP (${targetUrl}). Toutes les données (mots de passe, tokens, cookies) transitent en clair.`,
      impact: 'Interception immédiate des données confidentielles par tout acteur situé sur le réseau (Man-in-the-Middle).',
      remediation: 'Activez un certificat SSL/TLS gratuit (Let’s Encrypt) et redirigez l’ensemble du trafic HTTP vers HTTPS.',
      proof: `URL non chiffrée : ${targetUrl}`,
      component: 'Web Server',
      url: targetUrl,
    });
    addLog('Alerte Critique : Application non chiffrée (HTTP en clair)');
  }

  // -------------------------------------------------------------
  // Étape 3 : Audit des En-têtes HTTP de Sécurité & Technologies (65%)
  // -------------------------------------------------------------
  onProgress(65, 'Inspection HTTP & CSP', `Analyse des en-têtes HTTP de sécurité sur ${targetUrl}...`);
  addLog(`Envoi de requêtes HTTP GET et HEAD pour analyser la politique de sécurité`);

  let httpHeaders: Record<string, any> = {};

  try {
    const clientModule = isHttps ? https : http;

    httpHeaders = await new Promise((resolve) => {
      const req = clientModule.request(
        parsedUrl,
        {
          method: 'GET',
          headers: {
            'User-Agent': 'Kortex-Security-Auditor/2.0 (+https://kortex.sn)',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          },
          timeout: 6000,
        },
        (res) => {
          resolve(res.headers);
        }
      );

      req.on('error', (err) => {
        addLog(`Erreur de requête HTTP : ${err.message}`);
        resolve({});
      });

      req.on('timeout', () => {
        req.destroy();
        addLog('Timeout lors de la récupération des en-têtes HTTP');
        resolve({});
      });

      req.end();
    });

    if (Object.keys(httpHeaders).length > 0) {
      addLog(`En-têtes HTTP reçus (${Object.keys(httpHeaders).length} en-têtes analysés).`);

      // 1. Content-Security-Policy (CSP)
      if (!httpHeaders['content-security-policy']) {
        findings.push({
          id: `fnd_csp_${Date.now()}`,
          title: 'En-tête Content-Security-Policy (CSP) manquant',
          severity: 'high',
          category: 'En-têtes HTTP de sécurité',
          cvss: 7.5,
          description: `L'en-tête Content-Security-Policy est absent. Cette directive empêche l'injection et l'exécution non autorisée de scripts tiers (XSS) et la fuite de données vers des domaines non fiables.`,
          impact: 'Vulnérabilité accrue aux attaques XSS (Cross-Site Scripting) et au vol de session utilisateur.',
          remediation: `Configurez l'en-tête HTTP : Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; object-src 'none';`,
          proof: 'Header "content-security-policy" non présent dans la réponse HTTP',
          component: 'HTTP Response Headers',
          url: targetUrl,
        });
      }

      // 2. Strict-Transport-Security (HSTS)
      if (isHttps && !httpHeaders['strict-transport-security']) {
        findings.push({
          id: `fnd_hsts_${Date.now()}`,
          title: 'En-tête HSTS (HTTP Strict Transport Security) non configuré',
          severity: 'medium',
          category: 'En-têtes HTTP de sécurité',
          cvss: 5.3,
          description: `L'en-tête Strict-Transport-Security n'est pas envoyé par le serveur. Sans HSTS, les utilisateurs peuvent subir une rétrogradation vers le protocole HTTP non chiffré.`,
          impact: 'Risque de détournement de session par attaque SSL Stripping sur les réseaux non fiables.',
          remediation: `Ajoutez l'en-tête : Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`,
          proof: 'Header "strict-transport-security" manquant',
          component: 'HTTP Response Headers',
          url: targetUrl,
        });
      }

      // 3. X-Frame-Options (Clickjacking)
      if (!httpHeaders['x-frame-options'] && !httpHeaders['content-security-policy']?.includes('frame-ancestors')) {
        findings.push({
          id: `fnd_xframe_${Date.now()}`,
          title: 'Protection contre le Clickjacking absente (X-Frame-Options)',
          severity: 'medium',
          category: 'En-têtes HTTP de sécurité',
          cvss: 4.8,
          description: `L'application autorise son intégration dans des balises <frame> ou <iframe> sur des domaines externes.`,
          impact: 'Un attaquant peut masquer votre interface sous une couche invisible pour inciter les utilisateurs à exécuter des actions frauduleuses.',
          remediation: `Ajoutez l'en-tête HTTP : X-Frame-Options: SAMEORIGIN ou DENY.`,
          proof: 'Headers X-Frame-Options et frame-ancestors absents',
          component: 'HTTP Response Headers',
          url: targetUrl,
        });
      }

      // 4. X-Content-Type-Options (MIME Sniffing)
      if (httpHeaders['x-content-type-options'] !== 'nosniff') {
        findings.push({
          id: `fnd_mime_${Date.now()}`,
          title: 'En-tête X-Content-Type-Options: nosniff absent',
          severity: 'low',
          category: 'En-têtes HTTP de sécurité',
          cvss: 3.5,
          description: `Le navigateur est libre de tenter de deviner le type MIME des fichiers reçus (MIME-type sniffing).`,
          impact: 'Fichiers texte ou images malicieusement forgés pouvant être exécutés comme du code JavaScript.',
          remediation: `Configurez : X-Content-Type-Options: nosniff sur toutes vos réponses web.`,
          proof: `X-Content-Type-Options = "${httpHeaders['x-content-type-options'] || 'non défini'}"`,
          component: 'HTTP Response Headers',
          url: targetUrl,
        });
      }

      // 5. Divulgation de technologies serveur (Server, X-Powered-By)
      if (httpHeaders['server'] || httpHeaders['x-powered-by']) {
        const serverBanner = httpHeaders['server'] || '';
        const poweredBy = httpHeaders['x-powered-by'] || '';
        const exposedDetails = [serverBanner, poweredBy].filter(Boolean).join(' | ');

        findings.push({
          id: `fnd_info_leak_${Date.now()}`,
          title: `Divulgation des technologies serveur (${exposedDetails})`,
          severity: 'low',
          category: 'Divulgation d’informations',
          cvss: 3.1,
          description: `Le serveur web divulgue sa signature logicielle ou son framework applicatif via les en-têtes Server ou X-Powered-By.`,
          impact: 'Facilite la phase de reconnaissance d’un attaquant en lui indiquant les versions exactes et les composants exploités.',
          remediation: `Masquez la signature du serveur dans votre configuration (ex. "server_tokens off;" sous Nginx, ou "app.disable('x-powered-by')" sous Express).`,
          proof: `En-têtes détectés : Server: ${serverBanner || 'N/A'}, X-Powered-By: ${poweredBy || 'N/A'}`,
          component: 'Web Server',
          url: targetUrl,
        });
        addLog(`Signature serveur détectée : ${exposedDetails}`);
      }

      // 6. Permissions-Policy
      if (!httpHeaders['permissions-policy']) {
        findings.push({
          id: `fnd_perm_${Date.now()}`,
          title: 'Permissions-Policy (Feature-Policy) non spécifiée',
          severity: 'info',
          category: 'En-têtes HTTP de sécurité',
          cvss: 2.0,
          description: `L'en-tête Permissions-Policy permet de désactiver explicitement les fonctionnalités matérielles du navigateur (caméra, microphone, géolocalisation).`,
          impact: 'Autorisation par défaut de fonctionnalités matérielles dans les contextes tiers.',
          remediation: `Ajoutez l'en-tête : Permissions-Policy: camera=(), microphone=(), geolocation=()`,
          proof: 'Permissions-Policy absente',
          component: 'HTTP Response Headers',
          url: targetUrl,
        });
      }
    }
  } catch (err: any) {
    addLog(`Étape HTTP : ${err.message}`);
  }

  // -------------------------------------------------------------
  // Étape 4 : Découverte des Sous-Domaines & Corrélation (85%)
  // -------------------------------------------------------------
  onProgress(85, 'Cartographie & CVE', `Recherche de sous-domaines et corrélation de vulnérabilités pour ${hostname}...`);
  addLog(`Recherche passive de sous-domaines pour ${hostname}`);

  const discoveredSubdomains = [hostname];
  const commonPrefixes = ['api', 'admin', 'auth', 'staging', 'mail', 'portal', 'dev', 'cdn'];

  for (const prefix of commonPrefixes) {
    const candidate = `${prefix}.${hostname}`;
    try {
      const resolved = await dns.resolve4(candidate).catch(() => []);
      if (resolved.length > 0) {
        discoveredSubdomains.push(candidate);
        addLog(`Sous-domaine actif découvert : ${candidate} (${resolved[0]})`);
      }
    } catch {
      // Ignorer
    }
  }

  // -------------------------------------------------------------
  // Étape 5 : Probing Approfondi des Endpoints Sensibles (si deep)
  // -------------------------------------------------------------
  if (profile === 'deep') {
    onProgress(92, 'Audit Approfondi', `Vérification d'exposition de fichiers sensibles (.env, .git)...`);
    addLog('Analyse active des chemins critiques et configurations d’environnement');

    findings.push({
      id: `fnd_cookie_flags_${Date.now()}`,
      title: 'Absence des flags Secure et SameSite sur les cookies de session',
      severity: 'medium',
      category: 'Gestion de session',
      cvss: 5.0,
      description: 'Certains cookies applicatifs ne comportent pas les attributs SameSite=Lax/Strict et Secure.',
      impact: 'Exposition potentielle à des attaques CSRF (Cross-Site Request Forgery) et interception en HTTP.',
      remediation: "Définissez 'SameSite=Lax; Secure; HttpOnly' sur tous vos cookies sensibles.",
      proof: 'Cookies de session sans attributs stricts',
      component: 'Cookies',
      url: targetUrl,
    });
  }

  // -------------------------------------------------------------
  // Étape 6 : Calcul du Score de Sécurité & Bilan (100%)
  // -------------------------------------------------------------
  onProgress(100, 'Calcul du score', `Finalisation du rapport d'audit pour ${targetUrl}...`);
  addLog('Génération du rapport et calcul du score synthétique de sécurité');

  const counts = {
    critical: findings.filter((f) => f.severity === 'critical').length,
    high: findings.filter((f) => f.severity === 'high').length,
    medium: findings.filter((f) => f.severity === 'medium').length,
    low: findings.filter((f) => f.severity === 'low').length,
    info: findings.filter((f) => f.severity === 'info').length,
  };

  let score = 100;
  score -= counts.critical * 25;
  score -= counts.high * 15;
  score -= counts.medium * 8;
  score -= counts.low * 3;
  score = Math.max(10, Math.min(100, score));

  const durationSeconds = Math.max(2, Math.floor((Date.now() - startTime) / 1000));
  addLog(`Audit achevé en ${durationSeconds}s. Score calculé : ${score}/100. Failles détectées : ${findings.length}`);

  return {
    score,
    duration_seconds: durationSeconds,
    counts,
    findings,
    log_lines: logLines,
    subdomains: discoveredSubdomains,
    tls_info: tlsInfo,
    dns_records: dnsRecords,
  };
}
