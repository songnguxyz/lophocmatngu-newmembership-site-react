// iconMapper.js
import {
  GiStrong,
  GiBrain,
  GiRabbit,
  GiCrackedShield,
  GiTargeted,
  GiFallingLeaf,
  GiSandsOfTime,
  GiExtraTime,
  GiPunch,
  GiHeartPlus,
  GiStunGrenade,
  GiPoisonGas,
  GiSilenced,
  GiSnail,
  GiBlindfold,
  GiMuscleUp,
  GiGooeyEyedSun,
  GiBeveledStar,
  GiBloodyStash,
  GiSwordClash,
  GiThrustBend,
  GiAbstract020,
} from "react-icons/gi";

// ✅ Status effects (statusEffects)
export const statusIconMapper = {
  stun: GiStunGrenade,
  poison: GiPoisonGas, // Rõ nét hơn
  silence: GiSilenced,
  slow: GiSnail,
  blind: GiBlindfold,
};

// ✅ Buff/Debuff icons theo stat (dùng tiếng Việt)
export const statIconMapper = {
  "Sức mạnh": GiStrong,
  "Trí lực": GiBrain,
  "Nhanh nhẹn": GiRabbit,
  "Bền bỉ": GiCrackedShield,
  "Uy tín": GiGooeyEyedSun, // Khác với critRate
  "Khéo léo": GiFallingLeaf,
  "May mắn": GiBeveledStar,
  stamina: GiHeartPlus,
  actionGauge: GiSandsOfTime,
  extraAction: GiExtraTime,
  bonusHits: GiSwordClash,
  regen: GiHeartPlus,
  critRate: GiTargeted,
  critDamage: GiPunch,
  resistant: GiCrackedShield,
};

// ✅ Fallback icons
export const getBuffIcon = (statOrType) =>
  statIconMapper[statOrType] || GiMuscleUp;

export const getDebuffIcon = (statOrType) =>
  statIconMapper[statOrType] || GiBloodyStash;
