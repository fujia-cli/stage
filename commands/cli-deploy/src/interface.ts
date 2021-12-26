export type AppCategory = "web" | "app" | "electron" | "database" | "docker-nginx";

export type DatabaseType = "mongodb" | "mysql";

export type DeployType = "pm2" | "local+docker" | "local+docker";

export interface ServerInfo {
  userName: string;
  sshPort: number;
  serverIP: string;
}
