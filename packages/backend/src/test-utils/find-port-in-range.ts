import net from "node:net";

export async function findOpenPortInRange(
  min: number,
  max: number,
  host = "127.0.0.1",
  maxAttempts = 50
): Promise<number> {
  for (let i = 0; i < maxAttempts; i++) {
    const port = Math.floor(Math.random() * (max - min + 1)) + min;
    const isOpen = await canListen(port, host);
    if (isOpen) return port;
  }
  throw new Error(
    `Failed to find open port in range ${min}-${max} after ${maxAttempts} attempts`
  );
}

function canListen(port: number, host: string): Promise<boolean> {
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.unref();
    srv.once("error", () => {
      resolve(false);
    });
    srv.listen(port, host, () => {
      srv.close(() => resolve(true));
    });
  });
}
