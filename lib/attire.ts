export type Gender = "male" | "female";

export interface AttireOption {
  id: string;
  label: string;
  category: "Corporate" | "Casual";
  overlay: string;
}

export const ATTIRE: Record<Gender, AttireOption[]> = {
  male: [
    { id: "m1",  label: "Corporate 1", category: "Corporate", overlay: "/attire/male/male1.png" },
    { id: "m2",  label: "Corporate 2", category: "Corporate", overlay: "/attire/male/male2.png" },
    { id: "m3",  label: "Corporate 3", category: "Corporate", overlay: "/attire/male/male3.png" },
    { id: "m4",  label: "Corporate 4", category: "Corporate", overlay: "/attire/male/male4.png" },
    { id: "m5",  label: "Corporate 5", category: "Corporate", overlay: "/attire/male/male5.png" },
    { id: "m6",  label: "Casual 1",    category: "Casual",    overlay: "/attire/male/male6.png" },
    { id: "m7",  label: "Casual 2",    category: "Casual",    overlay: "/attire/male/male7.png" },
    { id: "m8",  label: "Casual 3",    category: "Casual",    overlay: "/attire/male/male8.png" },
    { id: "m9",  label: "Casual 4",    category: "Casual",    overlay: "/attire/male/male9.png" },
    { id: "m10", label: "Casual 5",    category: "Casual",    overlay: "/attire/male/male10.png" },
  ],
  female: [
    { id: "f1",  label: "Corporate 1", category: "Corporate", overlay: "/attire/female/female1.png" },
    { id: "f2",  label: "Corporate 2", category: "Corporate", overlay: "/attire/female/female2.png" },
    { id: "f3",  label: "Corporate 3", category: "Corporate", overlay: "/attire/female/female3.png" },
    { id: "f4",  label: "Corporate 4", category: "Corporate", overlay: "/attire/female/female4.png" },
    { id: "f5",  label: "Corporate 5", category: "Corporate", overlay: "/attire/female/female5.png" },
    { id: "f6",  label: "Casual 1",    category: "Casual",    overlay: "/attire/female/female6.png" },
    { id: "f7",  label: "Casual 2",    category: "Casual",    overlay: "/attire/female/female7.png" },
    { id: "f8",  label: "Casual 3",    category: "Casual",    overlay: "/attire/female/female8.png" },
    { id: "f9",  label: "Casual 4",    category: "Casual",    overlay: "/attire/female/female9.png" },
    { id: "f10", label: "Casual 5",    category: "Casual",    overlay: "/attire/female/female10.png" },
  ],
};

export const ATTIRE_CATEGORIES: Record<Gender, Array<"Corporate" | "Casual">> = {
  male:   ["Corporate", "Casual"],
  female: ["Corporate", "Casual"],
};
