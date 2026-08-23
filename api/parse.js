export default async function handler(req, res) {
    res.setHeader(
        "Access-Control-Allow-Origin",
        "*"
    );

    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET,POST,OPTIONS"
    );

    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type"
    );

    if (req.method === "OPTIONS") {
        return res.status(204).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            message: "请使用 POST 请求"
        });
    }

    try {
        const { url, code = "" } =
            typeof req.body === "string"
                ? JSON.parse(req.body)
                : req.body || {};

        if (!url) {
            return res.status(400).json({
                success: false,
                message: "请输入云盘分享链接"
            });
        }

        const cloud = detectCloud(url);

        return res.status(200).json({
            success: false,
            stage: "detected",
            cloud,
            shareCode: Boolean(code),
            message:
                `已识别为 ${cloud.name}。` +
                "该接口目前完成平台识别，后续通过官方 API/OAuth 获取文件信息。"
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "服务器内部错误"
        });
    }
}


function detectCloud(url) {

    const value =
        String(url)
            .toLowerCase()
            .trim();


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


    if (
        value.includes("dropbox.com")
    ) {
        return {
            id: "dropbox",
            name: "Dropbox"
        };
    }


    return {
        id: "unknown",
        name: "未知云盘"
    };
}
