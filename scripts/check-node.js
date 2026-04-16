const major = Number.parseInt(process.versions.node.split(".")[0] ?? "0", 10);

if (!Number.isFinite(major)) {
  console.error("Could not determine the current Node.js version.");
  process.exit(1);
}

if (major < 20) {
  console.error("");
  console.error(`Unsupported Node.js version detected: ${process.version}`);
  console.error("CareerForge supports Node 20, 22, 24, and currently tolerates Node 25 with a warning.");
  console.error("Please switch to Node 22 (recommended) before running this project.");
  console.error("");
  process.exit(1);
}

if (major >= 25) {
  console.warn("");
  console.warn(`Warning: Node.js ${process.version} is newer than the recommended runtime.`);
  console.warn("CareerForge is tested primarily on Node 20, 22, and 24 LTS-style runtimes.");
  console.warn("Node 25 is allowed, but native Next.js/V8 crashes may still happen.");
  console.warn("");
}
