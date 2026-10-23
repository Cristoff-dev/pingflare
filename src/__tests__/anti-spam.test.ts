import { sendOutageAlert } from "@/lib/resend";
import { redis } from "@/lib/redis";

jest.mock("@/lib/resend", () => ({
  sendOutageAlert: jest.fn(),
}));

jest.mock("@/lib/redis", () => ({
  redis: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));

async function processAlert(serviceId: number, isUp: boolean) {
  const alertKey = `alert_sent:${serviceId}`;
  if (!isUp) {
    const failureTime = await redis.get(alertKey);
    if (!failureTime) {
      await sendOutageAlert("Test API", "https://test.com", 500);
      await redis.set(alertKey, Date.now());
    }
  }
}

describe("Alert Anti-Spam State Machine", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("allows sending an alert on the first outage", async () => {
    (redis.get as jest.Mock).mockResolvedValue(null);

    await processAlert(1, false);

    expect(redis.get).toHaveBeenCalledWith("alert_sent:1");
    expect(sendOutageAlert).toHaveBeenCalledTimes(1);
    expect(redis.set).toHaveBeenCalledTimes(1);
  });

  it("blocks subsequent alerts if the service remains down", async () => {
    (redis.get as jest.Mock).mockResolvedValue(1729641600000);

    await processAlert(1, false);

    expect(redis.get).toHaveBeenCalledWith("alert_sent:1");
    expect(sendOutageAlert).not.toHaveBeenCalled();
    expect(redis.set).not.toHaveBeenCalled();
  });
});