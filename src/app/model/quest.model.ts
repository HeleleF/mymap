export interface StopInfo {
	fid: string;
	id?: string;
	name: string;
	description?: string;
	latitude: number;
	longitude: number;
	imageUrl?: string;
}

export enum QuestStatus {
	NOT_DONE,
	IN_PROGRESS,
	DONE
}

export enum QuestType {
	QUEST_CATCH_POKEMON,
	QUEST_USE_BERRY_IN_ENCOUNTER,
	QUEST_GET_BUDDY_CANDY,
	QUEST_LAND_THROW,
	QUEST_COMPLETE_RAID_BATTLE,
	QUEST_COMPLETE_GYM_BATTLE,
	QUEST_HATCH_EGG,
	QUEST_TRADE_POKEMON,
	QUEST_SPIN_POKESTOP,
	QUEST_EVOLVE_POKEMON,
	QUEST_TRANSFER_POKEMON,
	QUEST_SEND_GIFT,
	QUEST_UNKNOWN
}

export enum QuestReward {
	POKE_BALL,
	SUPER_BALL,
	ULTRA_ABALL,
	RAZZ_BERRY,
	PINAP_BERRY,
	Nanabbeere,
	GOLDEN_RAZZ_BERRY,
	SILVER_PINAB_BERRY,
	RARE_CANDY,
	STARDUST,
	REVIVE,
	MAX_REVIVE,
	POTION,
	SUPER_POTION,
	HYPER_POTION,
	MAX_POTION,
	QUICK_TM,
	CHARGE_TM,
	EVO_ITEM,
	KING_STONE,
	METAL_COAT,
	DRAGON_SCALE,
	UPGRADE,
	SUN_STONE,
	SINNOH_STONE,
	LURE_MODULE,
	LURE_MODULE_GLACIAL,
	LURE_MODULE_MOSSY,
	LURE_MODULE_MAGNETIC
}

export enum QuestEncounter {
	BULBASAUR,
	IVYSAUR,
	VENUSAUR,
	CHARMANDER,
	CHARMELEON,
	CHARIZARD,
	SQUIRTLE,
	WARTORTLE,
	BLASTOISE,
	CATERPIE,
	METAPOD,
	BUTTERFREE,
	WEEDLE,
	KAKUNA,
	BEEDRILL,
	PIDGEY,
	PIDGEOTTO,
	PIDGEOT,
	RATTATA,
	RATICATE,
	SPEAROW,
	FEAROW,
	EKANS,
	ARBOK,
	PIKACHU,
	RAICHU,
	SANDSHREW,
	SANDSLASH,
	NIDORAN_FEMALE,
	NIDORINA,
	NIDOQUEEN,
	NIDORAN_MALE,
	NIDORINO,
	NIDOKING,
	CLEFAIRY,
	CLEFABLE,
	VULPIX,
	NINETALES,
	JIGGLYPUFF,
	WIGGLYTUFF,
	ZUBAT,
	GOLBAT,
	ODDISH,
	GLOOM,
	VILEPLUME,
	PARAS,
	PARASECT,
	VENONAT,
	VENOMOTH,
	DIGLETT,
	DUGTRIO,
	MEOWTH,
	PERSIAN,
	PSYDUCK,
	GOLDUCK,
	MANKEY,
	PRIMEAPE,
	GROWLITHE,
	ARCANINE,
	POLIWAG,
	POLIWHIRL,
	POLIWRATH,
	ABRA,
	KADABRA,
	ALAKAZAM,
	MACHOP,
	MACHOKE,
	MACHAMP,
	BELLSPROUT,
	WEEPINBELL,
	VICTREEBEL,
	TENTACOOL,
	TENTACRUEL,
	GEODUDE,
	GRAVELER,
	GOLEM,
	PONYTA,
	RAPIDASH,
	SLOWPOKE,
	SLOWBRO,
	MAGNEMITE,
	MAGNETON,
	FARFETCH_D,
	DODUO,
	DODRIO,
	SEEL,
	DEWGONG,
	GRIMER,
	MUK,
	SHELLDER,
	CLOYSTER,
	GASTLY,
	HAUNTER,
	GENGAR,
	ONIX,
	DROWZEE,
	HYPNO,
	KRABBY,
	KINGLER,
	VOLTORB,
	ELECTRODE,
	EXEGGCUTE,
	EXEGGUTOR,
	CUBONE,
	MAROWAK,
	HITMONLEE,
	HITMONCHAN,
	LICKITUNG,
	KOFFING,
	WEEZING,
	RHYHORN,
	RHYDON,
	CHANSEY,
	TANGELA,
	KANGASKHAN,
	HORSEA,
	SEADRA,
	GOLDEEN,
	SEAKING,
	STARYU,
	STARMIE,
	MR_MIME,
	SCYTHER,
	JYNX,
	ELECTABUZZ,
	MAGMAR,
	PINSIR,
	TAUROS,
	MAGIKARP,
	GYARADOS,
	LAPRAS,
	DITTO,
	EEVEE,
	VAPOREON,
	JOLTEON,
	FLAREON,
	PORYGON,
	OMANYTE,
	OMASTAR,
	KABUTO,
	KABUTOPS,
	AERODACTYL,
	SNORLAX,
	ARTICUNO,
	ZAPDOS,
	MOLTRES,
	DRATINI,
	DRAGONAIR,
	DRAGONITE,
	MEWTWO,
	MEW,
	CHIKORITA,
	BAYLEEF,
	MEGANIUM,
	CYNDAQUIL,
	QUILAVA,
	TYPHLOSION,
	TOTODILE,
	CROCONAW,
	FERALIGATR,
	SENTRET,
	FURRET,
	HOOTHOOT,
	NOCTOWL,
	LEDYBA,
	LEDIAN,
	SPINARAK,
	ARIADOS,
	CROBAT,
	CHINCHOU,
	LANTURN,
	PICHU,
	CLEFFA,
	IGGLYBUFF,
	TOGEPI,
	TOGETIC,
	NATU,
	XATU,
	MAREEP,
	FLAAFFY,
	AMPHAROS,
	BELLOSSOM,
	MARILL,
	AZUMARILL,
	SUDOWOODO,
	POLITOED,
	HOPPIP,
	SKIPLOOM,
	JUMPLUFF,
	AIPOM,
	SUNKERN,
	SUNFLORA,
	YANMA,
	WOOPER,
	QUAGSIRE,
	ESPEON,
	UMBREON,
	MURKROW,
	SLOWKING,
	MISDREAVUS,
	UNOWN,
	WOBBUFFET,
	GIRAFARIG,
	PINECO,
	FORRETRESS,
	DUNSPARCE,
	GLIGAR,
	STEELIX,
	SNUBBULL,
	GRANBULL,
	QWILFISH,
	SCIZOR,
	SHUCKLE,
	HERACROSS,
	SNEASEL,
	TEDDIURSA,
	URSARING,
	SLUGMA,
	MAGCARGO,
	SWINUB,
	PILOSWINE,
	CORSOLA,
	REMORAID,
	OCTILLERY,
	DELIBIRD,
	MANTINE,
	SKARMORY,
	HOUNDOUR,
	HOUNDOOM,
	KINGDRA,
	PHANPY,
	DONPHAN,
	PORYGON2,
	STANTLER,
	SMEARGLE,
	MILTANK,
	LARVITAR,
	PUPITAR,
	TREECKO,
	GROVYLE,
	SCEPTILE,
	TORCHIC,
	COMBUSKEN,
	BLAZIKEN,
	MUDKIP,
	MARSHTOMP,
	SWAMPERT,
	POOCHYENA,
	MIGHTYENA,
	ZIGZAGOON,
	LINOONE,
	WURMPLE,
	SILCOON,
	BEAUTIFLY,
	CASCOON,
	DUSTOX,
	LOTAD,
	LOMBRE,
	LUDICOLO,
	SEEDOT,
	NUZLEAF,
	SHIFTRY,
	TAILLOW,
	SWELLOW,
	WINGULL,
	PELIPPER,
	RALTS,
	KIRLIA,
	GARDEVOIR,
	SURSKIT,
	MASQUERAIN,
	SHROOMISH,
	BRELOOM,
	SLAKOTH,
	VIGOROTH,
	NINCADA,
	NINJASK,
	SHEDINJA,
	WHISMUR,
	LOUDRED,
	EXPLOUD,
	MAKUHITA,
	HARIYAMA,
	AZURILL,
	NOSEPASS,
	SKITTY,
	DELCATTY,
	SABLEYE,
	MAWILE,
	ARON,
	LAIRON,
	AGGRON,
	MEDITITE,
	MEDICHAM,
	ELECTRIKE,
	MANECTRIC,
	PLUSLE,
	MINUN,
	VOLBEAT,
	ILLUMISE,
	ROSELIA,
	GULPIN,
	SWALOT,
	CARVANHA,
	SHARPEDO,
	WAILMER,
	WAILORD,
	NUMEL,
	CAMERUPT,
	TORKOAL,
	SPOINK,
	GRUMPIG,
	SPINDA,
	TRAPINCH,
	VIBRAVA,
	FLYGON,
	CACNEA,
	CACTURNE,
	SWABLU,
	ALTARIA,
	ZANGOOSE,
	SEVIPER,
	LUNATONE,
	SOLROCK,
	BARBOACH,
	WHISCASH,
	CORPHISH,
	CRAWDAUNT,
	BALTOY,
	CLAYDOL,
	LILEEP,
	CRADILY,
	ANORITH,
	ARMALDO,
	FEEBAS,
	MILOTIC,
	CASTFORM,
	KECLEON,
	SHUPPET,
	BANETTE,
	DUSKULL,
	DUSCLOPS,
	ABSOL,
	WYNAUT,
	SNORUNT,
	GLALIE,
	SPHEAL,
	SEALEO,
	WALREIN,
	CLAMPERL,
	HUNTAIL,
	GOREBYSS,
	RELICANTH,
	LUVDISC,
	BAGON,
	SHELGON,
	BELDUM,
	METANG,
	METAGROSS,
	TURTWIG,
	GROTLE,
	TORTERRA,
	CHIMCHAR,
	MONFERNO,
	INFERNAPE,
	PIPLUP,
	PRINPLUP,
	EMPOLEON,
	STARLY,
	STARAVIA,
	STARAPTOR,
	BIDOOF,
	BIBAREL,
	KRICKETOT,
	KRICKETUNE,
	SHINX,
	LUXIO,
	LUXRAY,
	BUDEW,
	CRANIDOS,
	SHIELDON,
	BURMY,
	WORMADAM,
	MOTHIM,
	COMBEE,
	VESPIQUEN,
	PACHIRISU,
	BUIZEL,
	FLOATZEL,
	CHERUBI,
	CHERRIM,
	SHELLOS,
	GASTRODON,
	AMBIPOM,
	DRIFLOON,
	DRIFBLIM,
	BUNEARY,
	LOPUNNY,
	MISMAGIUS,
	HONCHKROW,
	GLAMEOW,
	PURUGLY,
	CHINGLING,
	STUNKY,
	SKUNTANK,
	BRONZOR,
	BRONZONG,
	BONSLY,
	MIME_JR,
	HAPPINY,
	CHATOT,
	SPIRITOMB,
	GIBLE,
	GABITE,
	GARCHOMP,
	MUNCHLAX,
	RIOLU,
	LUCARIO,
	HIPPOPOTAS,
	HIPPOWDON,
	SKORUPI,
	DRAPION,
	CROAGUNK,
	TOXICROAK,
	CARNIVINE,
	FINNEON,
	LUMINEON,
	MANTYKE,
	SNOVER,
	ABOMASNOW,
	WEAVILE,
	ROTOM,
	ALOLA_EXEGGUTOR
}

export interface QuestInfo {
	stopName: string;
	taskDesc: string;
	status: QuestStatus;
	type: QuestType;
	reward: string;
	encounter?: string;
	quantity?: number;
}

export interface QuestFilter {
	types: string[];
	negateType?: boolean;
	hasReward?: boolean;
	rewards: string[];
	negateReward?: boolean;
	hasEncounter?: boolean;
	encounters: string[];
	negateEncounter?: boolean;
}

export interface QuestProps {
	stopName: string;
	taskDesc: string;
	status: QuestStatus;
	type: QuestType;
	reward: string;
	encounter?: string;
	quantity?: number;
	firestore_id: string;
}
