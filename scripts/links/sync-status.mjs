import { spawn } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const inputPath = path.resolve("src/data/links/links.json");
const outputPath = path.resolve("src/data/links/generated.json");
const userAgent =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const limitedStatusCodes = new Set([401, 403, 405, 429]);

const source = JSON.parse(readFileSync(inputPath, "utf-8"));
const checkedAt = new Date().toISOString();
const output = readJson(outputPath);
const currentUrls = getCurrentUrls(source);

pruneGeneratedOutput(output, currentUrls);

for (const item of source.blogroll ?? []) {
    const previous = output[item.url] ?? {};
    const probe = await probeReachability(item.url);
    const failCount = probe.status === "down" ? (previous.failCount ?? 0) + 1 : 0;
    const status = shouldPreservePreviousStatus(previous.status, probe.status, failCount)
        ? previous.status
        : probe.status;

    output[item.url] = {
        ...previous,
        status,
        checkedAt,
        httpCode: probe.httpCode,
        reason: probe.reason,
        failCount,
    };
}

writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(`Link statuses written to ${path.relative(process.cwd(), outputPath)}`);

function readJson(filePath) {
    try {
        return JSON.parse(readFileSync(filePath, "utf-8"));
    } catch {
        return {};
    }
}

function getCurrentUrls(source) {
    return new Set([
        ...(source.blogroll ?? []).map((item) => item.url),
        ...(source.videos ?? []).map((item) => item.url),
        ...(source.podcasts ?? []).map((item) => item.url),
    ]);
}

function pruneGeneratedOutput(output, currentUrls) {
    for (const url of Object.keys(output)) {
        if (!currentUrls.has(url)) {
            delete output[url];
        }
    }
}

async function probeReachability(url) {
    const headResult = await requestStatus(url, "HEAD");
    if (classifyStatus(headResult).status === "up") {
        return classifyStatus(headResult);
    }

    const getResult = await requestStatus(url, "GET");
    const getProbe = classifyStatus(getResult);
    if (getProbe.status === "up") return getProbe;

    const headProbe = classifyStatus(headResult);
    if (getProbe.status === "limited") return getProbe;
    if (headProbe.status === "limited") return headProbe;

    return getProbe.httpCode || getProbe.reason !== "request_failed" ? getProbe : headProbe;
}

function shouldPreservePreviousStatus(previousStatus, nextStatus, failCount) {
    return (
        nextStatus === "down" &&
        failCount < 2 &&
        Boolean(previousStatus) &&
        previousStatus !== "down"
    );
}

function classifyStatus(result) {
    if (result.httpCode >= 200 && result.httpCode < 400) {
        return {
            status: "up",
            httpCode: result.httpCode,
            reason: `http_${result.httpCode}`,
        };
    }

    if (limitedStatusCodes.has(result.httpCode)) {
        return {
            status: "limited",
            httpCode: result.httpCode,
            reason: `http_${result.httpCode}`,
        };
    }

    if (result.httpCode >= 400) {
        return {
            status: "down",
            httpCode: result.httpCode,
            reason: `http_${result.httpCode}`,
        };
    }

    return {
        status: "down",
        httpCode: 0,
        reason: classifyCurlExitCode(result.exitCode),
    };
}

function requestStatus(url, method) {
    return new Promise((resolve) => {
        const args = [
            "-L",
            "-sS",
            "-o",
            "/dev/null",
            "-w",
            "%{http_code}",
            "--retry",
            "2",
            "--retry-all-errors",
            "--retry-delay",
            "2",
            "--connect-timeout",
            "15",
            "--max-time",
            "30",
            "-A",
            userAgent,
            url,
        ];

        if (method === "HEAD") {
            args.splice(2, 0, "-I");
        } else {
            args.splice(2, 0, "-X", "GET");
        }

        const child = spawn("curl", args, { stdio: ["ignore", "pipe", "ignore"] });
        let stdout = "";

        child.stdout.on("data", (chunk) => {
            stdout += chunk.toString();
        });

        child.on("error", () => resolve({ httpCode: 0, exitCode: -1 }));
        child.on("close", (code) => {
            resolve({
                httpCode: Number.parseInt(stdout.trim(), 10) || 0,
                exitCode: code ?? 0,
            });
        });
    });
}

function classifyCurlExitCode(code) {
    if (code === 6) return "dns_error";
    if (code === 7) return "connection_failed";
    if (code === 28) return "timeout";
    if (code === 35) return "tls_error";
    if (code === 47) return "too_many_redirects";
    if (code === 56) return "connection_reset";
    return "request_failed";
}
