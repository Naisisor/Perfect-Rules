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

    "stack": "gvisor",

    "dns-hijack": [
      "0.0.0.0:53"
    ],

    "auto-route": true,

    "auto-detect-interface": false,

    "strict-route": true,

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

  const originalProxies = Array.isArray(config["proxies"])
    ? config["proxies"]
    : [];

  const proxyNames = [];

  originalProxies.forEach((proxy) => {

    if (proxy && proxy.name) {
      proxyNames.push(proxy.name);
    }

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

    "一键代理": "Proxy.png",

    "国内直连": "China.png",

    "AI": "AI.png",

    "YouTube": "YouTube.png",

    "Google": "Google.png",

    "GitHub": "GitHub.png",

    "网络检测": "Network-test.png",

    "Netflix": "Netflix.png",

    "Spotify": "Spotify.png",

    "Steam": "Steam.png",

    "Telegram": "Telegram.png",

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

    "英国": "Other.png",

    "其他地区": "Other.png"

  };


  function getGroupIcon(name) {

    if (!groupIcons[name]) {
      return undefined;
    }

    return iconBaseURL + groupIcons[name];

  }


  // ================================================================
  // 10. Managed groups
  // ================================================================

  const managedGroups = {

    "一键代理": true,

    "国内直连": true,

    "AI": true,

    "YouTube": true,

    "Google": true,

    "GitHub": true,

    "网络检测": true,

    "Netflix": true,

    "Spotify": true,

    "Steam": true,

    "Telegram": true,

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
  // ================================================================

  const preservedGroups = [];


  originalGroups.forEach((group) => {

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

    group.proxies =
      proxyNames.slice();

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
  // 18. Remove managed groups from preserved groups
  // ================================================================

  const finalPreservedGroups = [];


  preservedGroups.forEach((group) => {

    if (

      group &&

      group.name &&

      !managedGroups[group.name]

    ) {

      finalPreservedGroups.push(group);

    }

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

    "TikTok":
      createRuleProvider("tiktok.yaml"),

    "Apple":
      createRuleProvider("apple.yaml"),

    "Microsoft":
      createRuleProvider("microsoft.yaml"),

    "NetworkTest":
      createRuleProvider("network-test.yaml")

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

    "其他地区": []

  };


  originalProxies.forEach((proxy) => {

    if (!proxy || !proxy.name) {
      return;
    }


    const region =
      detectRegion(String(proxy.name));


    regionNodes[region].push(
      proxy.name
    );

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

      "interval": 300,

      "timeout": 5000,

      "tolerance": 50,

      "lazy": true,

      "max-failed-times": 3,

      "expected-status": 204

    };


    const icon =
      getGroupIcon(region);


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

  const mainSelector = {

    "name": "一键代理",

    "type": "select",

    "proxies":
      availableRegions.concat([
        "国内直连"
      ])

  };


  const mainIcon =
    getGroupIcon("一键代理");


  if (mainIcon) {

    mainSelector["icon"] =
      mainIcon;

  }


  // ================================================================
  // 28. Service groups
  // ================================================================

  function createBusinessGroup(name) {

    const group = {

      "name": name,

      "type": "select",

      "proxies":
        availableRegions.concat([
          "国内直连"
        ])

    };


    const icon =
      getGroupIcon(name);


    if (icon) {
      group["icon"] = icon;
    }


    return group;

  }


  // AI 组单独构造，不走 createBusinessGroup：
  //
  //   1. 类型用 fallback 而不是 select —— 顺序即优先级，只要首选健康
  //      就固定用它，出口 IP 不因延迟波动而漂移；同时不依赖
  //      profile.store-selected，地区组变动时不会弹回列表首项。
  //   2. 美国排第一位，首次加载即默认走美国。
  //   3. 不放入「国内直连」，避免误选后 ChatGPT 必然超时。
  //   4. 不放入「香港」：OpenAI 不支持香港，而香港节点做连通性
  //      健康检查是会通过的，属于「健康但不可用」。
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


    // 极端情况：机场只有香港节点 —— 退回全部地区，避免生成空组。
    if (proxies.length === 0) {

      availableRegions.forEach((region) => {
        proxies.push(region);
      });

    }


    const group = {

      "name": "AI",

      "type": "fallback",

      "proxies": proxies,

      "url":
        "https://www.gstatic.com/generate_204",

      "interval": 300,

      "timeout": 5000,

      "lazy": true,

      "max-failed-times": 3,

      "expected-status": 204

    };


    const icon =
      getGroupIcon("AI");


    if (icon) {
      group["icon"] = icon;
    }


    return group;

  }


  const businessGroups = [

    createAIGroup(),

    createBusinessGroup("YouTube"),

    createBusinessGroup("Google"),

    createBusinessGroup("GitHub"),

    createBusinessGroup("Netflix"),

    createBusinessGroup("Spotify"),

    createBusinessGroup("Steam"),

    createBusinessGroup("Telegram"),

    createBusinessGroup("TikTok"),

    createBusinessGroup("Apple"),

    createBusinessGroup("Microsoft"),

    createBusinessGroup("网络检测")

  ];


  // ================================================================
  // 29. Final proxy-group architecture
  //
  //   Airport basic groups
  //          ↓
  //   Perfect-Rules service groups
  //          ↓
  //   Perfect-Rules region groups
  //          ↓
  //   Domestic Direct
  //          ↓
  //   One-click Proxy
  //
  // ================================================================

  config["proxy-groups"] =

    finalPreservedGroups

      .concat(businessGroups)

      .concat(regionGroups)

      .concat([

        domesticDirectGroup,

        mainSelector

      ]);


  // ================================================================
  // 30. Routing rules
  //
  // Rule Provider order:
  //
  // NetworkTest
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
    // Network Test
    // --------------------------------------------------------------

    "RULE-SET,NetworkTest,网络检测",


    // --------------------------------------------------------------
    // AI
    //
    // 显式域名兜底：不依赖 geosite 数据与远程 rule-provider，
    // 任一环节加载失败时也不会漏到 MATCH 走「一键代理」。
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
    // 会被后面的 GEOSITE,google 抢去「Google」组。以下域名取自官方
    // geosite 的 google-deepmind 列表（google-gemini 已废弃并指向它）。

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

    // Gemini Code Assist
    "DOMAIN-SUFFIX,cloudaicompanion.googleapis.com,AI",

    "DOMAIN-SUFFIX,cloudcode-pa.googleapis.com,AI",

    "DOMAIN-SUFFIX,daily-cloudcode-pa.googleapis.com,AI",

    "DOMAIN-SUFFIX,aicode.googleapis.com,AI",

    "DOMAIN-SUFFIX,aida.googleapis.com,AI",

    // NotebookLM
    "DOMAIN-SUFFIX,notebooklm-pa.googleapis.com,AI",

    "DOMAIN-SUFFIX,notebooklm.googleapis.com,AI",

    "DOMAIN-SUFFIX,labstailwind.pa.googleapis.com,AI",

    "DOMAIN-SUFFIX,notebook.google,AI",

    "DOMAIN-SUFFIX,notebook.google.com,AI",

    "DOMAIN-SUFFIX,notebooklm.google,AI",

    "DOMAIN-SUFFIX,notebooklm.google.com,AI",

    // Jules / Labs / Flow / Opal
    "DOMAIN-SUFFIX,jules.google,AI",

    "DOMAIN-SUFFIX,jules.google.com,AI",

    "DOMAIN-SUFFIX,labs.google,AI",

    "DOMAIN-SUFFIX,labs.google.com,AI",

    "DOMAIN-SUFFIX,flow.google,AI",

    "DOMAIN-SUFFIX,flow.google.com,AI",

    "DOMAIN-SUFFIX,aisandbox-pa.googleapis.com,AI",

    "DOMAIN-SUFFIX,opal.google,AI",

    "DOMAIN-SUFFIX,opal.google.com,AI",

    // Antigravity
    "DOMAIN-SUFFIX,antigravity-pa.googleapis.com,AI",

    "DOMAIN-SUFFIX,antigravity.googleapis.com,AI",

    "DOMAIN-SUFFIX,antigravity.google,AI",

    "DOMAIN-SUFFIX,antigravity-unleash.goog,AI",

    // Stitch
    "DOMAIN-SUFFIX,stitch.withgoogle.com,AI",

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
    // TikTok
    // --------------------------------------------------------------

    "RULE-SET,TikTok,TikTok",


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

    "MATCH,一键代理"

  ];


  // ================================================================
  // 31. Return generated config
  // ================================================================

  return config;

};
