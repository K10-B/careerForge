const { existsSync } = require("fs");
const { spawn } = require("child_process");
const http = require("http");

require("./check-node");

const host = "localhost";
const port = 3000;
const url = `http://${host}:${port}`;
const nextBin = require.resolve("next/dist/bin/next");

let opened = false;

function openDetached(command, args) {
  spawn(command, args, { detached: true, stdio: "ignore" }).unref();
}

function getWindowsBrowserCandidates() {
  const programFiles = process.env.ProgramFiles;
  const programFilesX86 = process.env["ProgramFiles(x86)"];
  const localAppData = process.env.LOCALAPPDATA;

  return [
    programFiles && `${programFiles}\\Microsoft\\Edge\\Application\\msedge.exe`,
    programFilesX86 && `${programFilesX86}\\Microsoft\\Edge\\Application\\msedge.exe`,
    localAppData && `${localAppData}\\Microsoft\\Edge\\Application\\msedge.exe`,
    localAppData && `${localAppData}\\Google\\Chrome\\Application\\chrome.exe`,
    programFiles && `${programFiles}\\Google\\Chrome\\Application\\chrome.exe`,
    programFilesX86 && `${programFilesX86}\\Google\\Chrome\\Application\\chrome.exe`,
  ].filter(Boolean);
}

function openBrowser() {
  if (opened) {
    return;
  }

  opened = true;
  if (process.platform === "win32") {
    const browser = getWindowsBrowserCandidates().find((candidate) => existsSync(candidate));
    if (browser) {
      openDetached(browser, [url]);
      return;
    }

    openDetached("cmd", ["/c", "start", "", url]);
    return;
  }

  const command = process.platform === "win32" ? "cmd" : process.platform === "darwin" ? "open" : "xdg-open";
  openDetached(command, [url]);
}

function waitForServer() {
  const request = http.get(url, (response) => {
    response.resume();
    openBrowser();
  });

  request.on("error", () => {
    setTimeout(waitForServer, 500);
  });
}

const devServer = spawn(process.execPath, [nextBin, "dev", "--hostname", host, "--port", String(port)], {
  stdio: "inherit",
});

waitForServer();

devServer.on("exit", (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0);
});
