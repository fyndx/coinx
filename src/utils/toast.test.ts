jest.mock("burnt", () => ({
  toast: jest.fn(),
}));

import * as Burnt from "burnt";

import { showToast } from "./toast";

describe("showToast", () => {
  it("delegates to Burnt.toast with the provided payload", () => {
    showToast({
      title: "Saved",
      message: "Your changes were stored locally.",
      preset: "done",
    });

    expect(Burnt.toast).toHaveBeenCalledWith({
      title: "Saved",
      message: "Your changes were stored locally.",
      preset: "done",
    });
  });

  it("omits optional fields when they are not provided", () => {
    showToast({ title: "Saved" });

    expect(Burnt.toast).toHaveBeenCalledWith({
      title: "Saved",
      message: undefined,
      preset: undefined,
    });
  });
});
