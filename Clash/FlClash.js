const main = (config) => {

  // ================================================================
  // FlClash / Mihomo Perfect-Rules v1.0
  //
  // Architecture:
  //
  //   Airport Subscription
  //          ↓
  //   Preserve Airport Basic Groups
  //          ↓
  //   Dynamic Region Groups
  //          ↓
  //   Perfect-Rules Service Groups
  //          ↓
  //   Remote Rule Providers
  //
  // ================================================================


  // ================================================================
  // 1. Basic configuration
  // ================================================================

  config["mixed-port"] = 7890;

  config["mode"] = "rule";

  config["unified-delay"] = true;

  config["tcp-concurrent"] = true;

  config["log-level"] = "error";

  // Disable IPv6 to prevent IPv4 / IPv6 exit mismatch.
  config["ipv6"] = false;

  config["allow-lan"] = false;

  config["find-process-mode"] = "always";

  config["keep-alive-interval"] = 30;

  config["keep-alive-idle"] = 30;

  config["disable-keep-alive"] = false;


  // ================================================================
  // 2. Profile
  // ================================================================

  config["profile"] = {
    "store-selected": true,
    "store-fake-ip": true
  };


  // ================================================================
  // 3. DNS
  // ================================================================

  config["dns"] = {

    "enable": true,

    "listen": "0.0.0.0:53",

    "prefer-h3": false,

    "ipv6": false,

    "enhanced-mode": "fake-ip",

    "fake-ip-range": "172.19.0.1/16",

    "fake-ip-filter": [
      "+.lan",
      "+.local",
      "+.localhost",
      "+.home.arpa",

      "time.*.com",
      "time.*.gov",
      "pool.ntp.org",

      "+.push.apple.com",

      "mesu.apple.com",
      "swscan.apple.com",

      "captive.apple.com",

      "connectivitycheck.gstatic.com",

      "connectivitycheck.android.com",

      "www.msftconnecttest.com",

      "www.msftncsi.com"
    ],

    "default-nameserver": [
      "223.5.5.5",
      "119.29.29.29"
    ],

    "nameserver": [
      "https://dns.alidns.com/dns-query",
      "https://doh.pub/dns-query"
    ],

    "nameserver-policy": {

      "geosite:cn": [
        "https://dns.alidns.com/dns-query",
        "https://doh.pub/dns-query"
      ],

      "geosite:private": [
        "https://dns.alidns.com/dns-query",
        "https://doh.pub/dns-query"
      ],

      "geolocation-!cn": [
        "https://cloudflare-dns.com/dns-query",
        "https://dns.google/dns-query"
      ]

    },

    "proxy-server-nameserver": [
      "https://dns.alidns.com/dns-query",
      "https://doh.pub/dns-query"
    ],

    "direct-nameserver": [
      "https://dns.alidns.com/dns-query",
      "https://doh.pub/dns-query"
    ],

    "fallback": [
      "https://cloudflare-dns.com/dns-query",
      "https://dns.google/dns-query"
    ],

    "fallback-filter": {

      "geoip": true,

      "geoip-code": "CN",

      "geosite": [
        "gfw"
      ],

      "domain": [
        "+.google.com",
        "+.googleapis.com",
        "+.googlevideo.com",
        "+.youtube.com",
        "+.github.com",
        "+.openai.com",
        "+.chatgpt.com",
        "+.anthropic.com",
        "+.claude.ai"
      ]

    }

  };


  // ================================================================
  // 4. TUN
  // ================================================================

  config["tun"] = {

    "enable": true,

    "device": "FlClash",

    // 注意：stack 与 strict-route 由 FlClash 客户端自己控制
    // （实测会被覆盖成 stack=mixed、strict-route=false），
    // 写在这里不生效，故不再声明，避免造成「已配置」的错觉。
    // 需要调整请到 FlClash 的 TUN 设置里改。

    "dns-hijack": [
      "0.0.0.0:53"
    ],

    "auto-route": true,

    "auto-detect-interface": false,

    "mtu": 1280,

    "inet4-address": [
      "172.19.0.1/30"
    ],

    "auto-redirect": false,

    "disable-icmp-forwarding": true

  };


  // ================================================================
  // 5. Sniffer
  // ================================================================

  config["sniffer"] = {

    "enable": true,

    "parse-pure-ip": true,

    "force-dns-mapping": true,

    "override-destination": true,

    "sniff": {

      "HTTP": {
        "ports": [
          80,
          "8080-8880"
        ]
      },

      "TLS": {
        "ports": [
          443,
          8443
        ]
      },

      "QUIC": {
        "ports": [
          443,
          8443
        ]
      }

    },

    "skip-domain": [
      "+.push.apple.com",
      "+.mijia.cloud"
    ]

  };


  // ================================================================
  // 6. NTP
  // ================================================================

  config["ntp"] = {

    "enable": true,

    "write-to-system": false,

    "server": "time.apple.com",

    "port": 123,

    "interval": 30

  };


  // ================================================================
  // 7. Original airport proxies
  // ================================================================

  const rawProxies = Array.isArray(config["proxies"])
    ? config["proxies"]
    : [];


  // 去重 + 剔除无名节点。
  // mihomo 遇到同名节点或空名节点会拒绝整份配置，而机场订阅偶尔会
  // 下发重复条目，这里保留首次出现的那条并在写回前过滤掉其余。
  const seenProxyNames = new Set();

  const originalProxies = rawProxies.filter((proxy) => {

    if (!proxy || !proxy.name) {
      return false;
    }


    const name =
      String(proxy.name);


    if (seenProxyNames.has(name)) {
      return false;
    }


    seenProxyNames.add(name);

    return true;

  });


  config["proxies"] = originalProxies;


  const proxyNames = [];

  originalProxies.forEach((proxy) => {
    proxyNames.push(proxy.name);
  });


  // 机场常在 proxies 里夹带信息类「伪节点」（剩余流量：100GB、到期时间、
  // 官网 …）。它们不是真实代理，却会因为没有地区特征而被 detectRegion
  // 判成「其他地区」，把该地区组变成一坨死节点 —— 而「其他地区」正是
  // fallback 链的倒数第二环。同一个模式也用于过滤分组名（官网入口 之类）。
  const junkPattern =
    /官网|流量|剩余|到期|过期|套餐|订阅|重置|续费|网址|客服|公告|traffic|expire|expired|subscription|reset|official|website/i;


  // 只含真实节点的名单，供建地区组与改写机场自动选择组使用
  const validProxyNames = proxyNames.filter((name) => {

    return !junkPattern.test(name);

  });


  // ================================================================
  // 8. Original airport proxy groups
  // ================================================================

  const originalGroups = Array.isArray(config["proxy-groups"])
    ? config["proxy-groups"]
    : [];


  // ================================================================
  // 9. Perfect-Rules icon CDN
  // ================================================================

  const iconBaseURL =
    "https://cdn.jsdelivr.net/gh/Naisisor/Perfect-Rules@main/Clash/icons/";


  const groupIcons = {

    "默认代理": "Proxy.png",

    "自动-最快": "Proxy.png",

    "自动-香港优先": "Proxy.png",

    "自动-美国优先": "Proxy.png",

    "国内直连": "China.png",

    "AI": "AI.png",

    "YouTube": "YouTube.png",

    "Google": "Google.png",

    "GitHub": "GitHub.png",

    "广告拦截": "Ads.png",

    "X": "X.png",

    "Netflix": "Netflix.png",

    "Spotify": "Spotify.png",

    "Steam": "Steam.png",

    "Telegram": "Telegram.png",

    "WhatsApp": "WhatsApp.png",

    "TikTok": "TikTok.png",

    "Apple": "Apple.png",

    "Microsoft": "Microsoft.png",

    "香港": "Hong_Kong.png",

    "台湾": "Taiwan.png",

    "日本": "Japan.png",

    "新加坡": "Singapore.png",

    "韩国": "Korea.png",

    "美国": "United_States.png",

    "加拿大": "Other.png",

    "英国": "United_Kingdom.png",

    "德国": "Germany.png",

    "其他地区": "Other.png"

  };


  // 未单独配置图标的组使用的兜底图标
  const fallbackIconURL =
    iconBaseURL + "Other.png";


  // useFallback 为 true 时，未在 groupIcons 里登记的名字返回默认图标，
  // 而不是 undefined —— 用于地区组：以后新增地区（法国、澳大利亚…）
  // 即使忘了配图标，也能拿到一个可用的兜底图标。
  function getGroupIcon(name, useFallback) {

    if (groupIcons[name]) {
      return iconBaseURL + groupIcons[name];
    }


    if (useFallback) {
      return fallbackIconURL;
    }


    return undefined;

  }


  // ================================================================
  // 10. Managed groups
  // ================================================================

  const managedGroups = {

    "默认代理": true,

    "自动-最快": true,

    "自动-香港优先": true,

    "自动-美国优先": true,

    "国内直连": true,

    "AI": true,

    "YouTube": true,

    "Google": true,

    "GitHub": true,

    "广告拦截": true,

    "X": true,

    "Netflix": true,

    "Spotify": true,

    "Steam": true,

    "Telegram": true,

    "WhatsApp": true,

    "TikTok": true,

    "Apple": true,

    "Microsoft": true,

    "香港": true,

    "台湾": true,

    "日本": true,

    "新加坡": true,

    "韩国": true,

    "美国": true,

    "加拿大": true,

    "英国": true,

    "德国": true,

    "其他地区": true

  };


  // ================================================================
  // 11. Built-in targets
  // ================================================================

  const builtinTargets = {

    "DIRECT": true,

    "REJECT": true,

    "REJECT-DROP": true,

    "PASS": true,

    "COMPATIBLE": true,

    "GLOBAL": true

  };


  // ================================================================
  // 12. Business group detection
  // ================================================================

  function isBusinessGroupName(name) {

    if (!name) {
      return false;
    }

    const text = String(name);

    const patterns = [

      /ai/i,
      /openai/i,
      /chatgpt/i,
      /claude/i,
      /gemini/i,

      /netflix/i,
      /disney/i,
      /disney\+/i,

      /youtube/i,
      /google/i,
      /github/i,

      /spotify/i,
      /steam/i,
      /tiktok/i,
      /telegram/i,

      /twitter/i,
      /x\.com/i,
      /facebook/i,
      /instagram/i,

      /流媒体/i,
      /媒体/i,
      /影音/i,
      /视频/i,

      /游戏/i,
      /游戏专用/i,

      /机场专用/i,
      /节点分流/i

    ];

    for (let i = 0; i < patterns.length; i++) {

      if (patterns[i].test(text)) {
        return true;
      }

    }

    return false;

  }


  // ================================================================
  // 13. Auto-select detection
  // ================================================================

  function isAutoSelectGroup(name) {

    if (!name) {
      return false;
    }

    return (

      /自动选择/i.test(name) ||

      /auto[\s_-]*select/i.test(name) ||

      /auto[\s_-]*test/i.test(name) ||

      /测速/i.test(name)

    );

  }


  // ================================================================
  // 14. Failover detection
  // ================================================================

  function isFailoverGroup(name) {

    if (!name) {
      return false;
    }

    return (

      /故障转移/i.test(name) ||

      /failover/i.test(name) ||

      /fallback/i.test(name)

    );

  }


  // ================================================================
  // 15. All-node detection
  // ================================================================

  function isAllNodeName(name) {

    if (!name) {
      return false;
    }

    return (

      /全部节点/i.test(name) ||

      /所有节点/i.test(name) ||

      /全部/i.test(name) ||

      /all[\s_-]*nodes?/i.test(name) ||

      /all[\s_-]*proxies?/i.test(name)

    );

  }


  function getProxyComposition(group) {

    const result = {

      total: 0,

      actualNodes: 0,

      groups: 0,

      builtin: 0,

      unknown: 0

    };


    if (
      !group ||
      !Array.isArray(group.proxies)
    ) {

      return result;

    }


    result.total = group.proxies.length;


    group.proxies.forEach((item) => {

      if (!item) {
        return;
      }


      // 机场的信息类伪节点不算真实节点，
      // 否则「全是垃圾节点的组」会被误判成「全部节点组」。
      if (junkPattern.test(item)) {

        result.unknown++;

        return;

      }


      // Actual proxy node

      if (proxyNames.indexOf(item) !== -1) {

        result.actualNodes++;

        return;

      }


      // Built-in target

      if (builtinTargets[item]) {

        result.builtin++;

        return;

      }


      // Another proxy group

      const referencedGroup = originalGroups.some((g) => {

        return (

          g &&
          g.name === item

        );

      });


      if (referencedGroup) {

        result.groups++;

        return;

      }


      result.unknown++;

    });


    return result;

  }


  function isAllNodesGroup(group) {

    if (!group || !group.name) {
      return false;
    }

    const name = String(group.name);


    // Explicit all-node name

    if (isAllNodeName(name)) {
      return true;
    }


    // Business groups are never treated as all-node groups

    if (isBusinessGroupName(name)) {
      return false;
    }


    const composition =
      getProxyComposition(group);


    if (composition.total === 0) {
      return false;
    }


    // At least two actual nodes

    if (composition.actualNodes < 2) {
      return false;
    }


    // Actual nodes must represent a meaningful portion

    const ratio =
      composition.actualNodes /
      composition.total;


    if (ratio < 0.3) {
      return false;
    }


    // Groups containing other groups

    if (composition.groups > 0) {

      if (composition.actualNodes >= 5) {
        return true;
      }

      return false;

    }


    return true;

  }


  // ================================================================
  // 16. Preserve airport basic groups
  //
  // PRESERVE_AIRPORT_GROUPS = false：完全丢弃机场自建分组，输出只包含
  // 本脚本生成的组。这样分组结构完全可预测，也避免了机场的
  // 「自动选择」把全部节点再测一遍（移动端健康检查翻倍的主因）。
  //
  // 想保留机场的自动选择 / 故障转移 / 全部节点组时，把开关改成 true。
  // ================================================================

  const PRESERVE_AIRPORT_GROUPS = false;

  const preservedGroups = [];


  originalGroups.forEach((group) => {

    if (!PRESERVE_AIRPORT_GROUPS) {
      return;
    }


    if (!group || !group.name) {
      return;
    }


    if (managedGroups[group.name]) {
      return;
    }


    const isBasic =

      isAutoSelectGroup(group.name) ||

      isFailoverGroup(group.name) ||

      isAllNodesGroup(group);


    if (!isBasic) {
      return;
    }


    const copied =
      JSON.parse(JSON.stringify(group));


    // Keep airport group visible.

    delete copied["hidden"];


    // 彻底剔除伪节点（剩余流量 / 到期时间 / 官网 …）。
    //
    // 它们不是真实代理：留在候选里既可能成为 select 组的默认出口
    // （select 的默认项就是第一项），也会污染 url-test / fallback 的健康检查。
    //
    // 过滤后若组内一个真实节点都不剩，则整组丢弃 ——
    // 避免生成空候选组导致 mihomo 拒绝整份配置。
    if (Array.isArray(copied.proxies)) {

      copied.proxies =
        copied.proxies.filter((item) => {

          return !junkPattern.test(String(item));

        });


      if (copied.proxies.length === 0) {
        return;
      }

    }


    preservedGroups.push(copied);

  });


  // ================================================================
  // 17. Convert airport Auto-Select groups to URL-Test
  // ================================================================

  preservedGroups.forEach((group) => {

    if (!group || !group.name) {
      return;
    }


    if (!isAutoSelectGroup(group.name)) {
      return;
    }


    group.type = "url-test";

    // 只用真实节点：机场本身已经过滤干净时，不能在这里被塞回垃圾节点
    group.proxies =
      validProxyNames.length > 0
        ? validProxyNames.slice()
        : proxyNames.slice();

    group.url =
      "https://www.gstatic.com/generate_204";

    group.interval = 300;

    group.timeout = 5000;

    group.tolerance = 50;

    group.lazy = true;

    group["max-failed-times"] = 3;

    group["expected-status"] = 204;


    delete group["disable-udp"];

    delete group["strategy"];

  });


  // ================================================================
  // 19. Remote Rule Provider base URL
  // ================================================================

  const ruleBaseURL =
    "https://cdn.jsdelivr.net/gh/Naisisor/Perfect-Rules@main/Clash/rules/";


  // ================================================================
  // 20. Rule Provider factory
  // ================================================================

  function createRuleProvider(filename) {

    return {

      "type": "http",

      "behavior": "classical",

      "format": "yaml",

      "url": ruleBaseURL + filename,

      "path": "./rules/" + filename,

      "interval": 86400

    };

  }


  // ================================================================
  // 21. Remote Rule Providers
  // ================================================================

  config["rule-providers"] = {

    "AI":
      createRuleProvider("ai.yaml"),

    "YouTube":
      createRuleProvider("youtube.yaml"),

    "Google":
      createRuleProvider("google.yaml"),

    "GitHub":
      createRuleProvider("github.yaml"),

    "Netflix":
      createRuleProvider("netflix.yaml"),

    "Spotify":
      createRuleProvider("spotify.yaml"),

    "Steam":
      createRuleProvider("steam.yaml"),

    "Telegram":
      createRuleProvider("telegram.yaml"),

    "WhatsApp":
      createRuleProvider("whatsapp.yaml"),

    "TikTok":
      createRuleProvider("tiktok.yaml"),

    "Apple":
      createRuleProvider("apple.yaml"),

    "Microsoft":
      createRuleProvider("microsoft.yaml"),

    "Ads":
      createRuleProvider("ads.yaml"),

    "Twitter":
      createRuleProvider("twitter.yaml")

  };


  // ================================================================
  // 22. Region detection
  // ================================================================

  const regionPatterns = {

    "香港": [

      /🇭🇰/,
      /香港/i,
      /HK/i,
      /Hong\s*Kong/i,
      /HongKong/i

    ],


    "台湾": [

      /🇹🇼/,
      /台湾/i,
      /台灣/i,
      /\bTW\b/i,
      /(^|[^A-Za-z])TW[-_\s]?\d/i,
      /TPE/i,
      /KHH/i,
      /TSA/i,
      /Taiwan/i,
      /Taipei/i

    ],


    "日本": [

      /🇯🇵/,
      /日本/i,
      /\bJP\b/i,
      /(^|[^A-Za-z])JP[-_\s]?\d/i,
      /JPN/i,
      /NRT|HND|KIX|CTS|FUK|OKA|NGO/i,
      /Japan/i,
      /Tokyo/i,
      /Osaka/i

    ],


    "新加坡": [

      /🇸🇬/,
      /新加坡/i,
      /\bSG\b/i,
      /(^|[^A-Za-z])SG[-_\s]?\d/i,
      /SGP/i,
      /SIN/i,
      /XSP/i,
      /Singapore/i

    ],


    "韩国": [

      /🇰🇷/,
      /韩国/i,
      /韓國/i,
      /\bKR\b/i,
      /(^|[^A-Za-z])KR[-_\s]?\d/i,
      /ICN|GMP|PUS/i,
      /Korea/i,
      /Seoul/i

    ],


    // 美国节点命名最混乱，这里覆盖：
    //   旗帜 emoji（🇺🇸 01）
    //   国家名（美国 / 美西 / 美东 / 美区 / 美利坚 / United States / America）
    //   无分隔符编号（US01 / US-01 / US_01 / USA01 / 美01）
    //   主要机场三字码与城市名（英文 + 中文）
    //
    // 注意：三字码用 (^|[^A-Za-z]) ... (?![A-Za-z]) 卡住词边界，
    // 否则 AUS 会命中 Australia、DEN 会命中 Denmark。
    "美国": [

      /🇺🇸/,
      /美国/i,
      /美西/i,
      /美东/i,
      /美区/i,
      /美利坚/i,
      /美[-_\s]?\d/i,
      /\bUS\b/i,
      /(^|[^A-Za-z])USA/i,
      /(^|[^A-Za-z])US[-_\s]?\d/i,
      /(^|[^A-Za-z])US[-_\s]/i,
      /United\s*States/i,
      /\bAmerica\b/i,
      /Los\s*Angeles|San\s*Jose|San\s*Francisco|San\s*Diego|Salt\s*Lake|New\s*York/i,
      /Silicon\s*Valley|Las\s*Vegas|St\.?\s*Louis|Silicon\s*Valley/i,
      /Seattle|Miami|Dallas|Ashburn|Chicago|Phoenix|Atlanta|Boston|Denver|Portland/i,
      /Houston|Austin|Minneapolis|Detroit|Philadelphia|Washington|Honolulu|Anchorage/i,
      /Charlotte|Nashville|Columbus|Cleveland|Orlando|Tampa|Oakland/i,
      /(^|[^A-Za-z])(LAX|SFO|JFK|SJC|SEA|ORD|DFW|MIA|IAD|ATL|PHX|EWR|BOS|DEN|LAS|MSP|DTW|CLT|PHL|IAH|SAN|PDX|AUS|SLC|MCO|HNL|STL|RDU|BNA|MCI|SAT|OAK|BUR|SNA|SMF|SJU|PIT|BWI|DCA|MDW|TPA|CLE|CVG|IND|CMH|MKE|JAX|PBI|ONT|ANC)(?![A-Za-z])/i,
      /洛杉矶|圣何塞|圣荷西|硅谷|西雅图|达拉斯|迈阿密|芝加哥|凤凰城|阿什本|纽约/i,
      /亚特兰大|波士顿|丹佛|拉斯维加斯|波特兰|休斯顿|奥斯汀|费城|华盛顿/i,
      /圣地亚哥|圣迭戈|檀香山|盐湖城|底特律|明尼阿波利斯|夏洛特|纳什维尔/i,
      /圣路易斯|哥伦布|安克雷奇|奥兰多|坦帕|克利夫兰|奥克兰/i

    ],


    "加拿大": [

      /🇨🇦/,
      /加拿大/i,
      /Canada/i,
      /Toronto/i,
      /Vancouver/i,
      /Montreal/i

    ],


    // 原来用裸 /UK/i 做子串匹配，会把 Ukraine、含 "uk" 的任意名字
    // 误判成英国，这里改为词边界。
    "英国": [

      /🇬🇧/,
      /英国/i,
      /\bUK\b/i,
      /\bGB\b/i,
      /United\s*Kingdom/i,
      /England/i,
      /London/i,
      /Manchester/i

    ],


    // 德国。注意只能用 /\bDE\b/，裸 /DE/i 会把 Sweden 也判成德国。
    "德国": [

      /🇩🇪/,
      /德国/i,
      /德國/i,
      /\bDE\b/i,
      /(^|[^A-Za-z])DE[-_\s]?\d/i,
      /Germany/i,
      /Frankfurt/i,
      /Falkenstein/i,
      /Nuremberg|Nürnberg/i,
      /Berlin/i,
      /Munich|München/i,
      /Dusseldorf|Düsseldorf/i,
      /Hamburg/i,
      /Stuttgart/i,
      /Cologne|Köln/i,
      /法兰克福|法兰/i,
      /柏林/i,
      /慕尼黑/i

    ],


    // 荷兰。常见机房：阿姆斯特丹 AMS / Hetzner。
    "荷兰": [

      /🇳🇱/,
      /荷兰/i,
      /荷蘭/i,
      /\bNL\b/i,
      /(^|[^A-Za-z])NL[-_\s]?\d/i,
      /Netherlands|Holland/i,
      /Amsterdam/i,
      /阿姆斯特丹/i

    ],


    // 爱沙尼亚。常见机房：塔林 TLL / Hetzner。
    "爱沙尼亚": [

      /🇪🇪/,
      /爱沙尼亚/i,
      /愛沙尼亞/i,
      /\bEE\b/i,
      /(^|[^A-Za-z])EE[-_\s]?\d/i,
      /Estonia/i,
      /Tallinn/i,
      /塔林/i

    ]

  };


  // 按「名字中最先出现的地区标记」判定归属。
  //
  // 原实现是「按对象键顺序首次命中即返回」，而香港排在第一个键，
  // 于是 `美国-HK-IEPL-01`、`US-HK-03`、`HK-US-01` 这类双标记节点
  // 一律被判给香港，美国组因此经常缺节点甚至整组消失。
  function detectRegion(proxyName) {

    const text = String(proxyName);

    let bestRegion = "其他地区";
    let bestIndex = Infinity;
    let bestScore = 0;


    for (const region in regionPatterns) {

      if (
        !Object.prototype.hasOwnProperty.call(
          regionPatterns,
          region
        )
      ) {
        continue;
      }


      const patterns =
        regionPatterns[region];

      let firstIndex = Infinity;
      let score = 0;


      for (let i = 0; i < patterns.length; i++) {

        const matched =
          patterns[i].exec(text);

        if (!matched) {
          continue;
        }

        score++;

        if (matched.index < firstIndex) {
          firstIndex = matched.index;
        }

      }


      if (score === 0) {
        continue;
      }


      // 先比位置：名字里出现得更早的地区优先；
      // 位置相同时再比命中数量。
      if (
        firstIndex < bestIndex ||

        (
          firstIndex === bestIndex &&
          score > bestScore
        )
      ) {

        bestIndex = firstIndex;
        bestScore = score;
        bestRegion = region;

      }

    }


    return bestRegion;

  }


  // ================================================================
  // 23. Build region node lists
  // ================================================================

  const regionNodes = {

    "香港": [],

    "台湾": [],

    "日本": [],

    "新加坡": [],

    "韩国": [],

    "美国": [],

    "加拿大": [],

    "英国": [],

    "德国": [],

    "荷兰": [],

    "爱沙尼亚": [],

    "其他地区": []

  };


  originalProxies.forEach((proxy) => {

    if (!proxy || !proxy.name) {
      return;
    }


    const name =
      String(proxy.name);


    // 跳过机场下发的信息类伪节点。
    // 少了这一步，它们会因为没有地区特征而全部堆进「其他地区」，
    // 把那一组变成纯死节点，而它正是 fallback 链的倒数第二环。
    if (junkPattern.test(name)) {
      return;
    }


    const region =
      detectRegion(name);


    regionNodes[region].push(
      name
    );

  });


  // ================================================================
  // 23.1 Drop airport region-named groups
  //
  // 方案 B：丢弃机场自建的地区命名组（「🇭🇰 香港节点」「日本节点」
  // 「美国专线」…）。脚本已经按地区生成了标准组，这类组只是重复，
  // 而且成员往往不如脚本过滤得干净。
  //
  // 判定用的是「组名」而非成员 —— 「九云」「自动选择」「故障转移」
  // 「全部节点」这类非地区命名会原样保留。
  //
  // 必须放在这里：detectRegion 依赖 regionPatterns，而 regionPatterns
  // 是 const，早于本节调用会触发 TDZ。
  // ================================================================

  const finalPreservedGroups =
    preservedGroups.filter((group) => {

      return detectRegion(String(group.name)) === "其他地区";

    });


  // ================================================================
  // 24. Region order
  // ================================================================

  const regionOrder = [

    "香港",

    "台湾",

    "日本",

    "新加坡",

    "韩国",

    "美国",

    "加拿大",

    "英国",

    "德国",

    "荷兰",

    "爱沙尼亚",

    "其他地区"

  ];


  // ================================================================
  // 25. Create region URL-Test groups
  // ================================================================

  const regionGroups = [];


  regionOrder.forEach((region) => {

    const nodes =
      regionNodes[region];


    if (
      !nodes ||
      nodes.length === 0
    ) {
      return;
    }


    const group = {

      "name": region,

      "type": "url-test",

      "proxies": nodes,

      "url":
        "https://www.gstatic.com/generate_204",

      // 600s：地区组多、成员多时，300s 会让健康检查非常密集
      // （实测 600+ 节点时约 4.5 次/秒、每天 38 万次请求）。
      // 配合 lazy:true，空载时还会进一步降频。
      "interval": 600,

      "timeout": 5000,

      "tolerance": 50,

      "lazy": true,

      "max-failed-times": 3,

      "expected-status": 204

    };


    // 第二个参数 true = 未单独配置图标的地区使用默认图标兜底
    const icon =
      getGroupIcon(region, true);


    if (icon) {
      group["icon"] = icon;
    }


    regionGroups.push(group);

  });


  const availableRegions =
    regionGroups.map((group) => {

      return group.name;

    });


  // ================================================================
  // 25.1 Auto-selection chains
  //
  // 自动链：作为各业务组的第一个候选 / 默认选项。两套语义：
  //
  //   url-test  —— 按延迟择优，跨地区也挑最快的。用于「自动-最快」：
  //                期望是「哪个延时低用哪个」，所以不锁地区。
  //   fallback  —— 按顺序取第一个可用地区，不比较延迟。用于
  //                「自动-美国优先」：AI 需要稳定出口，宁可慢也不跳 IP。
  //
  // 地区内部仍然是 url-test，按延迟挑该地区最快的节点。
  //
  // 必须在这里创建：后面的「默认代理」与业务组都会引用它，晚于它们会触发
  // const 的 TDZ。
  // ================================================================

  function createAutoChain(name, preferredRegions, groupType, excludeHongKong, tolerance) {

    const preferred = preferredRegions.filter((region) => {

      return availableRegions.indexOf(region) !== -1;

    });


    const rest = availableRegions.filter((region) => {

      return (
        preferred.indexOf(region) === -1 &&
        !(excludeHongKong && region === "香港")
      );

    });


    const proxies =
      preferred.concat(rest);


    // 极端情况兜底：没有任何地区组时指向 DIRECT，避免空组
    if (proxies.length === 0) {
      proxies.push("DIRECT");
    }


    const group = {

      "name": name,

      "type": groupType,

      "proxies": proxies,

      "url":
        "https://www.gstatic.com/generate_204",

      "interval": 600,

      "timeout": 5000,

      "lazy": true,

      "max-failed-times": 3,

      "expected-status": 204

    };


    // url-test 的切换容差（ms）：新地区要比当前快这么多才切换，
    // 避免延迟小波动就来回换地区、导致出口 IP 漂移。
    if (groupType === "url-test" && tolerance) {
      group["tolerance"] = tolerance;
    }


    const icon =
      getGroupIcon(name);


    if (icon) {
      group["icon"] = icon;
    }


    return group;

  }


  // 只有存在地区组时才创建降级链；否则业务组不注入（避免循环引用）
  const autoGroups = [];

  if (availableRegions.length > 0) {

    // 最快优先：按延迟择优，不锁地区（url-test）
    //
    // 成员顺序按「预期延迟从低到高」排列（中国大陆出发的经验值）：
    //   香港 10-40ms / 台湾 30-60 / 日本 40-80 / 韩国 50-90 /
    //   新加坡 60-110 / 美国 130-220 / 加拿大 160-240 /
    //   英国 200-260 / 德国 230-290 / 荷兰 240-300 / 爱沙尼亚 250-310
    //
    // url-test 本身不看顺序，这里只是让界面顺序与实际最可能被选中的
    // 地区一致，并让首次测速完成前先落到香港（通常延迟最低）。
    // 「其他地区」不在列表里，会自动追加到末尾。
    autoGroups.push(createAutoChain(
      "自动-最快",
      [
        "香港",
        "台湾",
        "日本",
        "韩国",
        "新加坡",
        "美国",
        "加拿大",
        "英国",
        "德国",
        "荷兰",
        "爱沙尼亚"
      ],
      "url-test",
      false,
      200
    ));


    // 美国优先：给 AI 用（不含香港 —— OpenAI 不支持，fallback 保稳定出口）
    autoGroups.push(createAutoChain(
      "自动-美国优先",
      [
        "美国",
        "日本",
        "新加坡",
        "台湾",
        "韩国",
        "加拿大",
        "英国",
        "德国",
        "荷兰",
        "爱沙尼亚"
      ],
      "fallback",
      true
    ));


    // 香港优先：fallback 保稳定出口，供用户在各业务组里手动选择。
    // 不设为默认 —— 默认仍是「自动-最快」。
    autoGroups.push(createAutoChain(
      "自动-香港优先",
      [
        "香港",
        "台湾",
        "日本",
        "韩国",
        "新加坡",
        "美国",
        "加拿大",
        "英国",
        "德国",
        "荷兰",
        "爱沙尼亚"
      ],
      "fallback",
      false
    ));

  }


  // ================================================================
  // 26. Domestic Direct
  // ================================================================

  const domesticDirectGroup = {

    "name": "国内直连",

    "type": "select",

    "proxies": [
      "DIRECT"
    ]

  };


  const domesticIcon =
    getGroupIcon("国内直连");


  if (domesticIcon) {

    domesticDirectGroup["icon"] =
      domesticIcon;

  }


  // ================================================================
  // 27. One-click Proxy
  // ================================================================

  // 首项放自动链 —— select 的默认项就是第一项。
  // 「自动-最快」为默认，「自动-香港优先」作为备用自动模式供手动选择。
  const mainCandidates =
    (autoGroups.length > 0
      ? ["自动-最快", "自动-香港优先"]
      : []).concat(
      availableRegions,
      [
        "国内直连"
      ]
    );


  const mainSelector = {

    "name": "默认代理",

    "type": "select",

    "proxies": mainCandidates

  };


  const mainIcon =
    getGroupIcon("默认代理");


  if (mainIcon) {

    mainSelector["icon"] =
      mainIcon;

  }


  // ================================================================
  // 28. Service groups
  // ================================================================

  // autoChains：自动链数组，按顺序插在候选最前面。
  // 第一项即 select 组的默认项，其余作为可选的自动模式。
  function createBusinessGroup(name, autoChains) {

    const candidates =
      (autoChains && autoGroups.length > 0
        ? autoChains
        : []).concat(
        availableRegions,
        [
          "国内直连"
        ]
      );


    const group = {

      "name": name,

      "type": "select",

      "proxies": candidates

    };


    const icon =
      getGroupIcon(name);


    if (icon) {
      group["icon"] = icon;
    }


    return group;

  }


  // AI 组单独构造：美国优先 + 手动选择（select）。
  //
  // 用 select 而不是 fallback —— 美国节点故障时不自动转移。自动降级会
  // 悄悄更换出口 IP，OpenAI 的风控会看到 IP 跳变，反而更容易触发验证。
  //
  // 候选：美国 > 日本 > 新加坡 > 台湾 > 韩国 > 其余地区。
  // 不含香港（OpenAI 不支持，而香港节点做连通性检查会通过，属
  // 「健康但不可用」），也不含「国内直连」。
  function createAIGroup() {

    const preferred = [
      "美国",
      "日本",
      "新加坡",
      "台湾",
      "韩国"
    ].filter((region) => {

      return availableRegions.indexOf(region) !== -1;

    });


    const backup = availableRegions.filter((region) => {

      return (
        preferred.indexOf(region) === -1 &&
        region !== "香港"
      );

    });


    const proxies =
      preferred.concat(backup);


    // 极端情况兜底，避免生成空候选组（mihomo 会因此拒绝整份配置）
    if (proxies.length === 0) {
      proxies.push("默认代理");
    }


    // 默认项必须是「美国」这个地区组本身，而不是降级链。
    // 降级链放在第 2 位：需要自动降级时手动切过去即可。
    // 这样 AI 的出口稳定在美国，不会因美国节点波动而悄悄换到日本，
    // 避免 OpenAI 风控看到 IP 跳变。
    if (autoGroups.length > 0) {
      proxies.splice(1, 0, "自动-美国优先");
    }


    const group = {

      "name": "AI",

      "type": "select",

      "proxies": proxies

    };


    const icon =
      getGroupIcon("AI");


    if (icon) {
      group["icon"] = icon;
    }


    return group;

  }


  // 业务组：首项均为自动降级链，往下是手动可选的地区
  const defaultChains = ["自动-最快", "自动-香港优先"];

  const businessGroups = [

    // AI 服务：美国优先链 + 手动选择（OpenAI 不支持香港）
    createAIGroup(),

    createBusinessGroup("YouTube", defaultChains),

    createBusinessGroup("Telegram", defaultChains),

    createBusinessGroup("WhatsApp", defaultChains),

    createBusinessGroup("X", defaultChains),

    createBusinessGroup("Netflix", defaultChains),

    createBusinessGroup("Google", defaultChains),

    createBusinessGroup("GitHub", defaultChains),

    createBusinessGroup("Spotify", defaultChains),

    createBusinessGroup("TikTok", defaultChains),

    createBusinessGroup("Steam", defaultChains),

    createBusinessGroup("Apple", defaultChains),

    createBusinessGroup("Microsoft", defaultChains)
  ];


  // 广告拦截：默认 REJECT，可在界面上切换为 DIRECT。
  // 规则表里排在很靠前的位置，拦截优先于其他所有分流。
  const adBlockGroup = {

    "name": "广告拦截",

    "type": "select",

    "proxies": [
      "REJECT",
      "DIRECT"
    ]

  };


  const adBlockIcon =
    getGroupIcon("广告拦截");


  if (adBlockIcon) {
    adBlockGroup["icon"] = adBlockIcon;
  }


  // ================================================================
  // 29. Final proxy-group architecture
  //
  //   Airport basic groups
  //          ↓
  //   Perfect-Rules service groups
  //          ↓
  //   Network Test
  //          ↓
  //   Perfect-Rules region groups
  //          ↓
  //   Domestic Direct
  //          ↓
  //   One-click Proxy
  //
  // ================================================================

  config["proxy-groups"] =

    // 默认代理放第一位：它是所有未指定流量的出口，最常需要查看 / 切换
    [mainSelector]

      .concat(finalPreservedGroups)

      .concat(businessGroups)

      .concat(regionGroups)

      .concat([

        domesticDirectGroup,

        adBlockGroup

      ])

      // 自动降级链放最末尾：它们是各业务组内部的默认选项，
      // 正常情况下不需要直接操作
      .concat(autoGroups);


  // ================================================================
  // 30. Routing rules
  //
  // Rule Provider order:
  //
  // AI
  // YouTube
  // Google
  // GitHub
  // Netflix
  // Spotify
  // Steam
  // Telegram
  // TikTok
  // Apple
  // Microsoft
  // Private
  // China
  // MATCH
  //
  // YouTube MUST be before Google.
  //
  // ================================================================

  config["rules"] = [

    // --------------------------------------------------------------
    // Private / LAN
    // --------------------------------------------------------------

    "DOMAIN-SUFFIX,lan,DIRECT",

    "DOMAIN-SUFFIX,local,DIRECT",

    "DOMAIN-SUFFIX,localhost,DIRECT",

    "IP-CIDR,127.0.0.0/8,DIRECT,no-resolve",

    "IP-CIDR,10.0.0.0/8,DIRECT,no-resolve",

    "IP-CIDR,172.16.0.0/12,DIRECT,no-resolve",

    "IP-CIDR,192.168.0.0/16,DIRECT,no-resolve",


    // --------------------------------------------------------------
    // Ads
    // --------------------------------------------------------------

    "RULE-SET,Ads,广告拦截",


    // --------------------------------------------------------------
    // AI
    //
    // 显式域名兜底：不依赖 geosite 数据与远程 rule-provider，
    // 任一环节加载失败时也不会漏到 MATCH 走「默认代理」。
    // --------------------------------------------------------------

    "DOMAIN-SUFFIX,openai.com,AI",

    "DOMAIN-SUFFIX,chatgpt.com,AI",

    "DOMAIN-SUFFIX,chat.com,AI",

    "DOMAIN-SUFFIX,oaistatic.com,AI",

    "DOMAIN-SUFFIX,oaiusercontent.com,AI",

    "DOMAIN-SUFFIX,sora.com,AI",

    "DOMAIN-SUFFIX,anthropic.com,AI",

    "DOMAIN-SUFFIX,claude.ai,AI",

    "DOMAIN-SUFFIX,muse.ai,AI",

    // Gemini / Google DeepMind
    //
    // Gemini 挂在 google.com / googleapis.com 之下，若不在这里显式拦截，
    // 规则集或 geosite 故障时会被后面的 GEOSITE,google 抢去「Google」组。
    // 以下域名取自官方 geosite 的 google-deepmind 列表。
    //
    // 只保留「日常使用 Gemini / AI Studio / Generative Language API」
    // 必需的域名。google-deepmind 里的长尾附加产品已精简掉：
    //   Gemini Code Assist、NotebookLM、Jules、Labs、Flow、Opal、
    //   Antigravity、Stitch
    // 正常场景下这些仍由 GEOSITE,category-ai-!cn 兜住，
    // 仅规则集/geosite 故障时不再计入。需要时按名字从上游列表加回即可。

    // DeepMind
    "DOMAIN-SUFFIX,deepmind.com,AI",

    "DOMAIN-SUFFIX,deepmind.google,AI",

    // Generative Language API
    "DOMAIN-SUFFIX,geller-pa.googleapis.com,AI",

    "DOMAIN-SUFFIX,generativelanguage.googleapis.com,AI",

    "DOMAIN-SUFFIX,proactivebackend-pa.googleapis.com,AI",

    "DOMAIN-SUFFIX,robinfrontend-pa.googleapis.com,AI",

    // Gemini 网页版 / AI Studio
    "DOMAIN-SUFFIX,gemini.google,AI",

    "DOMAIN-SUFFIX,gemini.google.com,AI",

    "DOMAIN-SUFFIX,gemini.gstatic.com,AI",

    "DOMAIN-SUFFIX,geminiweb-pa.clients.google.com,AI",

    "DOMAIN-SUFFIX,geminiweb-pa.clients6.google.com,AI",

    "DOMAIN-SUFFIX,bard.google.com,AI",

    "DOMAIN-SUFFIX,ai.studio,AI",

    "DOMAIN-SUFFIX,aistudio.google.com,AI",

    "DOMAIN-SUFFIX,ai.google.dev,AI",

    "DOMAIN-SUFFIX,generativeai.google,AI",

    "DOMAIN-SUFFIX,makersuite.google.com,AI",

    "DOMAIN-SUFFIX,alkalicore-pa.clients6.google.com,AI",

    "DOMAIN-SUFFIX,alkalimakersuite-pa.clients6.google.com,AI",

    "DOMAIN-SUFFIX,webchannel-alkalimakersuite-pa.clients6.google.com,AI",

    "RULE-SET,AI,AI",


    // --------------------------------------------------------------
    // YouTube
    // --------------------------------------------------------------

    "RULE-SET,YouTube,YouTube",


    // --------------------------------------------------------------
    // Google
    // --------------------------------------------------------------

    "RULE-SET,Google,Google",


    // --------------------------------------------------------------
    // GitHub
    // --------------------------------------------------------------

    "RULE-SET,GitHub,GitHub",


    // --------------------------------------------------------------
    // Netflix
    // --------------------------------------------------------------

    "RULE-SET,Netflix,Netflix",


    // --------------------------------------------------------------
    // Spotify
    // --------------------------------------------------------------

    "RULE-SET,Spotify,Spotify",


    // --------------------------------------------------------------
    // Steam
    // --------------------------------------------------------------

    "RULE-SET,Steam,Steam",


    // --------------------------------------------------------------
    // Telegram
    // --------------------------------------------------------------

    "RULE-SET,Telegram,Telegram",


    // --------------------------------------------------------------
    // WhatsApp
    // --------------------------------------------------------------

    "RULE-SET,WhatsApp,WhatsApp",


    // --------------------------------------------------------------
    // TikTok
    // --------------------------------------------------------------

    "RULE-SET,TikTok,TikTok",


    // --------------------------------------------------------------
    // X（原 Twitter）
    // --------------------------------------------------------------

    "RULE-SET,Twitter,X",


    // --------------------------------------------------------------
    // Apple
    // --------------------------------------------------------------

    "RULE-SET,Apple,Apple",


    // --------------------------------------------------------------
    // Microsoft
    // --------------------------------------------------------------

    "RULE-SET,Microsoft,Microsoft",


    // --------------------------------------------------------------
    // Private
    // --------------------------------------------------------------

    "GEOSITE,private,国内直连",

    "GEOIP,private,国内直连,no-resolve",


    // --------------------------------------------------------------
    // China
    // --------------------------------------------------------------

    "GEOSITE,cn,国内直连",

    "GEOIP,cn,国内直连,no-resolve",


    // --------------------------------------------------------------
    // Final
    // --------------------------------------------------------------

    "MATCH,默认代理"

  ];


  // ================================================================
  // 31. Return generated config
  // ================================================================

  return config;

};
