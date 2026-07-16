export type RobotPresetId = "turret";

export type RobotPreset = {
  id: RobotPresetId;
  name: string;
  description: string;
  nameKey: string;
  descriptionKey: string;
  width: number;
  length: number;
  accent: string;
};

export const robotPresets: RobotPreset[] = [
  {
    id: "turret",
    name: "Turret Shooter",
    description: "Mecanum - continuous intake - indexed feeder - adjustable hood",
    nameKey: "ftcTurretShooter",
    descriptionKey: "ftcTurretShooterDescription",
    width: 17,
    length: 17,
    accent: "cyan",
  },
];
