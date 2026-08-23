function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}

function detectCloud(url) {
  const value = String(url || "").toLowerCase();

  if (
    value.includes("123pan.com") ||
    value.includes("123684.com")
  ) {
    return {
      id: "123pan",
      name: "123云盘"
    };
  }

  if (
    value.includes("pan.baidu.com") ||
    value.includes("baidu.com/s/")
  ) {
    return {
      id: "baidu",
      name: "百度网盘"
    };
  }

  if (
    value.includes("pan.quark.cn") ||
    value.includes("quark.cn/s/")
  ) {
    return {
      id: "quark",
      name: "夸克网盘"
    };
  }

  if (
    value.includes("aliyundrive.com") ||
    value.includes("alipan.com")
  ) {
    return {
      id: "aliyun",
      name: "阿里云盘"
    };
  }

  if (
    value.includes("1drv.ms") ||
    value.includes("onedrive.live.com")
  ) {
    return {
      id: "onedrive",
      name: "OneDrive"
    };
  }

  return {
    id: "unknown",
    name: "未知云盘"
  };
}

export default async function handler(request) {

  if (request.method === "OPTIONS") {
    return json({}, 204);
  }

  if (request.method !== "POST") {
    return json({
      success: false,
      message: "请使用 POST 请求。"
    }, 405);
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return json({
      success: false,
      message: "请求数据格式错误。"
    }, 400);
  }

  const url = String(body.url || "").trim();
  const code = String(body.code || "").trim();

  if (!url) {
    return json({
      success: false,
      message: "请输入云盘分享链接。"
    }, 400);
  }

  const cloud = detectCloud(url);

  /*
   * 目前第一阶段先完成：
   * 1. 云盘识别
   * 2. API 后端连接
   * 3. 为各平台预留官方 API 适配器
   *
   * 真正读取文件必须使用对应平台允许的
   * 官方 API / OAuth 授权。
   */

  if (cloud.id === "123pan") {

    const clientId =
      process.env.PAN123_CLIENT_ID;

    const clientSecret =
      process.env.PAN123_CLIENT_SECRET;

    if (!clientId || !clientSecret) {

      return json({
        success: false,
        stage: "authorization_required",
        cloud,
        message:
          "已识别为 123 云盘，但尚未配置 123 云盘 OpenAPI 凭证。",
        setup: {
          provider: "123云盘",
          requiredEnvironmentVariables: [
            "PAN123_CLIENT_ID",
            "PAN123_CLIENT_SECRET"
          ]
        }
      });
    }

    /*
     * 这里暂时不伪造 API 请求。
     *
     * 123 云盘官方 OpenAPI 的具体鉴权参数、
     * endpoint 和分享接口应以你创建应用后
     * 开放平台给出的最新文档为准。
     *
     * 配置凭证后，我们再接具体接口。
     */

    return json({
      success: false,
      stage: "api_ready",
      cloud,
      shareCodeProvided: Boolean(code),
      message:
        "123 云盘 OpenAPI 凭证已配置，下一步接入具体分享文件接口。"
    });
  }

  return json({
    success: false,
    stage: "authorization_required",
    cloud,
    shareCodeProvided: Boolean(code),
    message:
      `已识别为 ${cloud.name}，但该平台尚未配置官方 API / OAuth。`
  });
}
