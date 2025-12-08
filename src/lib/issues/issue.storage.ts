import browser from "webextension-polyfill";

export type Issue = {
  token: string;
  createdAt: number;
  dismissedUntil: number | null;
};

export enum TokenStatus {
  REGISTERED = "registered",
  DISMISSED = "dismissed",
  UNKNOWN = "unknown",
}

type TokensByStatus = Record<TokenStatus, string[]>;

export class IssueStorage {
  private ISSUES_KEY = "issues";
  private DISMISS_INTERVAL: number = 86_400_000;
  private issues: Issue[] = [];

  async load() {
    const result = (await browser.storage.local.get(this.ISSUES_KEY)) as Record<string, Issue[]>;

    let issues: Issue[] = result[this.ISSUES_KEY] ?? [];

    issues = issues.map((item) => this.expireDismissal(item));

    this.issues = issues;
  }

  private async writeToStorage() {
    await browser.storage.local.set({ [this.ISSUES_KEY]: this.issues });
  }

  getIssues() {
    return this.issues;
  }

  async addIssues(tokens: string[]) {
    this.issues = [...this.issues.map(this.expireDismissal), ...tokens.map(this.buildIssue)];

    await this.writeToStorage();
  }

  private buildIssue(token: string): Issue {
    return { token, createdAt: Date.now(), dismissedUntil: null };
  }

  private expireDismissal(item: Issue): Issue {
    return item.dismissedUntil !== null && item.dismissedUntil < Date.now() ? { ...item, dismissedUntil: null } : item;
  }

  private isStillDismissed(item: Issue): boolean {
    return (item.dismissedUntil ?? 0) > Date.now();
  }

  async dismiss(tokens: string[], interval: number = this.DISMISS_INTERVAL) {
    this.issues = this.issues.map((item) =>
      tokens.includes(item.token) ? { ...item, dismissedUntil: Date.now() + interval } : this.expireDismissal(item),
    );

    await this.writeToStorage();
  }

  toActiveIssues(): string[] {
    return this.issues.filter((item) => this.isStillDismissed(item)).map((item) => item.token);
  }

  findTokenStatuses(tokens: string[]): TokensByStatus {
    const result: TokensByStatus = {
      [TokenStatus.REGISTERED]: [],
      [TokenStatus.DISMISSED]: [],
      [TokenStatus.UNKNOWN]: [],
    };

    const sourceTokens = Object.fromEntries(tokens.map((t) => [t, true]));

    for (const item of this.issues) {
      if (sourceTokens[item.token]) {
        result[this.isStillDismissed(item) ? TokenStatus.DISMISSED : TokenStatus.REGISTERED].push(item.token);

        delete sourceTokens[item.token];
      }
    }

    result[TokenStatus.UNKNOWN] = Object.keys(sourceTokens);

    return result;
  }
}
