type TimeWindow = {
  windowMs: number;
  max: number;
};

class SlidingWindow {
  private timestamps: number[] = [];
  constructor(private windowMs: number) {}
  add(now = Date.now()) {
    this.cleanup(now);
    this.timestamps.push(now);
  }
  count(now = Date.now()) {
    this.cleanup(now);
    return this.timestamps.length;
  }
  cleanup(now = Date.now()) {
    const threshold = now - this.windowMs;
    let i = 0;
    while (i < this.timestamps.length && this.timestamps[i] <= threshold) i++;
    if (i > 0) this.timestamps.splice(0, i);
  }
}

export class RateLimiter {
  private ipMap = new Map<string, SlidingWindow>();
  private emailMap = new Map<string, SlidingWindow>();
  constructor(
    private ipWindow: TimeWindow = {windowMs: 60 * 60 * 1000, max: 5},
    private emailWindow: TimeWindow = {windowMs: 60 * 60 * 1000, max: 3},
  ) {}

  consume(ip: string, email?: string) {
    const now = Date.now();

    const ipKey = ip || "unknown";
    let ipWindow = this.ipMap.get(ipKey);
    if (!ipWindow) {
      ipWindow = new SlidingWindow(this.ipWindow.windowMs);
      this.ipMap.set(ipKey, ipWindow);
    }
    const ipCount = ipWindow.count(now);
    if (ipCount >= this.ipWindow.max) {
      return {
        allowed: false,
        reason: `ip_limit_exceeded`,
        retryAfterMs:
          this.ipWindow.windowMs -
          (now -
            ((ipWindow as unknown as {timestamps?: number[]}).timestamps?.[0] ??
              0)),
      };
    }

    if (email) {
      const emailKey = email.toLowerCase();
      let emailWindow = this.emailMap.get(emailKey);
      if (!emailWindow) {
        emailWindow = new SlidingWindow(this.emailWindow.windowMs);
        this.emailMap.set(emailKey, emailWindow);
      }
      const emailCount = emailWindow.count(now);
      if (emailCount >= this.emailWindow.max) {
        return {
          allowed: false,
          reason: `email_limit_exceeded`,
          retryAfterMs:
            this.emailWindow.windowMs -
            (now -
              ((emailWindow as unknown as {timestamps?: number[]})
                .timestamps?.[0] ?? 0)),
        };
      }
      // both allowed, add
      ipWindow.add(now);
      emailWindow.add(now);
      return {allowed: true};
    }

    // no email provided, only track IP
    ipWindow.add(now);
    return {allowed: true};
  }
}

// Export a default global limiter instance for quick use. Swap this for a Redis-backed
// implementation in production.
export const defaultLimiter = new RateLimiter();
