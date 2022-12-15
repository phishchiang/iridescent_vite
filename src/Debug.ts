import { GUI } from "dat.gui"

export class Debug {
  private gui: GUI

  public settings: {
    u_fresnel_speed: number,
    u_fresnel_tile: number
  }

  constructor() {
    this.settings = {
      u_fresnel_speed: 0.1,
      u_fresnel_tile: 2.0,
    }
    this.gui = new GUI()
    this.gui.add(this.settings, "u_fresnel_speed", -0.5, 0.5, 0.01)
    this.gui.add(this.settings, "u_fresnel_tile", 0, 5, 0.01)
  }
}