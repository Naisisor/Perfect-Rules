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

    "一键代理": "Proxy.png",

    "国内直连": "China.png",

    "AI": "AI.png",

    "YouTube": "YouTube.png",

    "Google": "Google.png",

    "GitHub": "GitHub.png",

    "网络检测": "Network-test.png",

    "广告拦截": "Ads.png",

    "软件分流": "Software.png",

    "X": "X.png",

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

    "广告拦截": true,

    "软件分流": true,

    "X": true,

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


    // 彻底剔除伪节点（剩余流量 / 到期时间 / 官网 …）。
    //
    // 它们不是真实代理：留在候选里既可能成为 select 组的默认出口
    // （select 的默认项就是第一项，「网络检测」跟随机场默认选择器走时
    // 会被一起带偏），也会污染 url-test / fallback 的健康检查。
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
  // 18. Find airport default manual selector
  //
  // 网络检测 组需要跟随「机场自己的默认手动选择器」，而不是固定落在
  // 某个地区，否则用 ipinfo.io 之类站点自查出口 IP 时会看到错的节点：
  //
  //   网络检测
  //       ↓
  //   机场默认选择器
  //       ↓
  //   用户选中的节点
  //
  // 不要硬编码具体机场组名，这里按特征自动挑选。
  //
  // 注：preservedGroups 在第 16 节已经过滤掉 managedGroups，
  // 因此不再需要单独生成 finalPreservedGroups。
  // ================================================================

  function findDefaultAirportGroup() {

    const candidates = [];


    originalGroups.forEach((group) => {

      if (!group || !group.name) {
        return;
      }


      const name =
        String(group.name);


      // 跳过信息 / 广告类分组
      if (junkPattern.test(name)) {
        return;
      }


      // 跳过 Perfect-Rules 托管组
      if (managedGroups[name]) {
        return;
      }


      // 跳过自动选择组
      if (isAutoSelectGroup(name)) {
        return;
      }


      // 跳过故障转移组
      if (isFailoverGroup(name)) {
        return;
      }


      // 跳过明显的业务分组
      if (isBusinessGroupName(name)) {
        return;
      }


      if (group.type !== "select") {
        return;
      }


      const composition =
        getProxyComposition(group);


      if (composition.actualNodes < 2) {
        return;
      }


      candidates.push(group);

    });


    // 优先选「全部节点」型手动选择器，
    // 例如 机场名 / 节点 / 全部节点 这类结构。
    for (let i = 0; i < candidates.length; i++) {

      if (isAllNodesGroup(candidates[i])) {
        return candidates[i].name;
      }

    }


    // 否则退回第一个符合条件的 select 组
    if (candidates.length > 0) {
      return candidates[0].name;
    }


    return null;

  }


  const defaultAirportGroup =
    findDefaultAirportGroup();


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
      createRuleProvider("network-test.yaml"),

    "Ads":
      createRuleProvider("ads.yaml"),

    "Software":
      createRuleProvider("software.yaml"),

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


  // 地区锁较硬的服务用 fallback 组：顺序即优先级，首选健康就固定用它，
  // 出口 IP 不因延迟波动而漂移；也不依赖 profile.store-selected，
  // 地区组变动时不会像 select 组那样弹回列表首项。
  //
  // preferredRegions 按优先级排列；不在列表里的地区作为后备。
  //
  // includeHongKong 控制是否把「香港」作为最后兜底：
  //   AI 不启用 —— OpenAI 不支持香港，而香港节点做连通性健康检查
  //   是会通过的，属于「健康但不可用」；
  //   YouTube / Netflix / X 启用 —— 香港对这三者完全可用且延迟最低。
  function createFallbackGroup(name, preferredRegions, includeHongKong) {

    const preferred = preferredRegions.filter((region) => {

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


    // 香港作为最后兜底
    if (
      includeHongKong &&
      availableRegions.indexOf("香港") !== -1
    ) {
      proxies.push("香港");
    }


    // 极端情况兜底，避免生成空候选组（mihomo 会因此拒绝整份配置）：
    //   1) 机场只有香港节点      -> 退回全部地区
    //   2) 连地区组都没生成（订阅里没有任何有效真实节点）
    //                           -> 退回「一键代理」
    if (proxies.length === 0) {

      availableRegions.forEach((region) => {
        proxies.push(region);
      });

    }


    if (proxies.length === 0) {
      proxies.push("一键代理");
    }


    const group = {

      "name": name,

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
      getGroupIcon(name);


    if (icon) {
      group["icon"] = icon;
    }


    return group;

  }


  // 需要固定美国优先的业务组，共用这份地区优先级
  const usFirstRegions = [
    "美国",
    "日本",
    "新加坡",
    "台湾",
    "韩国"
  ];


  const businessGroups = [

    // 美国优先：AI 服务（OpenAI 不支持香港，末尾不补香港）
    createFallbackGroup("AI", usFirstRegions),

    // 美国优先：YouTube（香港对 YouTube 可用，作末尾兜底）
    createFallbackGroup("YouTube", usFirstRegions, true),

    createBusinessGroup("Google"),

    createBusinessGroup("GitHub"),

    // 美国优先：Netflix（香港对 Netflix 可用，作末尾兜底）
    createFallbackGroup("Netflix", usFirstRegions, true),

    createBusinessGroup("Spotify"),

    createBusinessGroup("Steam"),

    createBusinessGroup("Telegram"),

    createBusinessGroup("TikTok"),

    // 美国优先：X（香港对 X 可用，作末尾兜底）
    createFallbackGroup("X", usFirstRegions, true),

    createBusinessGroup("软件分流"),

    createBusinessGroup("Apple"),

    createBusinessGroup("Microsoft")

  ];


  // 网络检测 单独构造：跟随机场默认手动选择器，
  // 让测速 / 查 IP 站点反映你实际选中的出口节点。
  // 机场无可用手动选择器时，退回「一键代理」。
  const networkTestGroup = {

    "name": "网络检测",

    "type": "select",

    "proxies":
      defaultAirportGroup
        ? [defaultAirportGroup]
        : ["一键代理"]

  };


  const networkTestIcon =
    getGroupIcon("网络检测");


  if (networkTestIcon) {
    networkTestGroup["icon"] = networkTestIcon;
  }


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

    preservedGroups

      .concat(businessGroups)

      .concat([

        networkTestGroup

      ])

      .concat(regionGroups)

      .concat([

        domesticDirectGroup,

        adBlockGroup,

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
    // Software（按进程分流）
    //
    // 覆盖 Discord / Steam / Epic Games / WhatsApp。
    // 依赖 find-process-mode，本脚本已设为 "always"。
    // --------------------------------------------------------------

    "RULE-SET,Software,软件分流",


    // --------------------------------------------------------------
    // Ads
    // --------------------------------------------------------------

    "RULE-SET,Ads,广告拦截",


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

    "MATCH,一键代理"

  ];


  // ================================================================
  // 31. Return generated config
  // ================================================================

  return config;

};
