import type { AnatomicalRegionId, AnatomicalZoom } from './anatomicalRegions';
export type SorenessView = 'F' | 'B';
export type SorenessSide = 'left' | 'right' | 'center';
export type SorenessKind = 'muscleGroup' | 'deepReference' | 'fascia' | 'tendon' | 'jointArea' | 'region';
export interface SorenessRegionDefinition {
  readonly id: AnatomicalRegionId;
  readonly tissue: 'muscle' | 'joint';
  readonly zoom: AnatomicalZoom;
  readonly kind: SorenessKind;
  readonly deep: boolean;
  readonly sources: readonly string[];
  readonly paths: Partial<Record<SorenessView, Partial<Record<SorenessSide, string>>>>;
}
/** 觀察位置，非精確肌肉或診斷邊界。每面／側別獨立校準；來源見 QA 文件。 */
export const sorenessRegions: readonly SorenessRegionDefinition[] = [
  {
    "id": "scm",
    "tissue": "muscle",
    "zoom": "neck",
    "paths": {
      "F": {
        "right": "M463 268L470 280L489 303L478 306L466 288Z",
        "left": "M551 268L544 280L527 303L538 306L548 288Z"
      }
    },
    "deep": false,
    "sources": [
      "S4"
    ],
    "kind": "muscleGroup"
  },
  {
    "id": "traps",
    "tissue": "muscle",
    "zoom": "neck",
    "paths": {
      "F": {
        "right": "M443 300L464 316L424 335L389 345L375 332Z",
        "left": "M567 300L546 316L587 335L621 345L637 332Z"
      },
      "B": {
        "left": "M464 292L477 307L479 343L422 363L380 340L427 315Z",
        "right": "M548 292L536 308L534 342L588 363L630 340L587 315Z"
      }
    },
    "deep": false,
    "sources": [
      "S2",
      "S4"
    ],
    "kind": "muscleGroup"
  },
  {
    "id": "chest",
    "tissue": "muscle",
    "zoom": "torso",
    "paths": {
      "F": {
        "right": "M391 365L451 348L498 360L497 445L443 460L389 435Z",
        "left": "M519 360L563 350L620 370L621 435L568 458L519 445Z"
      }
    },
    "deep": false,
    "sources": [
      "S2"
    ],
    "kind": "muscleGroup"
  },
  {
    "id": "deltoid",
    "tissue": "muscle",
    "zoom": "arms",
    "paths": {
      "F": {
        "right": "M354 350L379 354L385 386L369 416L354 459L312 452L329 391Z",
        "left": "M635 351L660 360L683 396L702 452L662 465L646 414L630 386Z"
      }
    },
    "deep": false,
    "sources": [
      "S2"
    ],
    "kind": "muscleGroup"
  },
  {
    "id": "biceps",
    "tissue": "muscle",
    "zoom": "arms",
    "paths": {
      "F": {
        "right": "M304 490L368 503L353 540L332 562L303 550Z",
        "left": "M649 505L710 490L714 542L694 563L666 547Z"
      }
    },
    "deep": false,
    "sources": [
      "S2"
    ],
    "kind": "muscleGroup"
  },
  {
    "id": "forearmF",
    "tissue": "muscle",
    "zoom": "arms",
    "paths": {
      "F": {
        "right": "M293 587L326 591L316 638L294 680L271 705L266 682L273 622Z",
        "left": "M691 590L721 587L737 624L745 683L729 706L707 655Z"
      }
    },
    "deep": false,
    "sources": [
      "S2"
    ],
    "kind": "muscleGroup"
  },
  {
    "id": "abs",
    "tissue": "muscle",
    "zoom": "torso",
    "paths": {
      "F": {
        "right": "M457 480L497 474L497 683L456 675L448 546Z",
        "left": "M519 474L558 480L568 546L559 675L519 683Z"
      }
    },
    "deep": false,
    "sources": [
      "S7"
    ],
    "kind": "muscleGroup"
  },
  {
    "id": "obliques",
    "tissue": "muscle",
    "zoom": "torso",
    "paths": {
      "F": {
        "right": "M391 469L437 484L432 556L438 674L397 687L388 605Z",
        "left": "M579 484L620 464L628 529L618 684L579 672L584 555Z"
      }
    },
    "deep": false,
    "sources": [
      "S7"
    ],
    "kind": "muscleGroup"
  },
  {
    "id": "hipFlexor",
    "tissue": "muscle",
    "zoom": "hip",
    "paths": {
      "F": {
        "right": "M412 763L449 751L486 778L473 813L426 807Z",
        "left": "M528 779L566 752L606 763L590 808L542 813Z"
      }
    },
    "deep": true,
    "sources": [
      "S3",
      "S8"
    ],
    "kind": "deepReference"
  },
  {
    "id": "quads",
    "tissue": "muscle",
    "zoom": "hip",
    "paths": {
      "F": {
        "right": "M395 842L440 836L461 877L454 951L437 998L399 994L384 938Z",
        "left": "M558 836L606 843L628 936L614 994L575 999L559 951L548 880Z"
      }
    },
    "deep": false,
    "sources": [
      "S3",
      "S8"
    ],
    "kind": "muscleGroup"
  },
  {
    "id": "adductors",
    "tissue": "muscle",
    "zoom": "hip",
    "paths": {
      "F": {
        "right": "M468 841L484 832L476 899L466 953L451 993L458 923Z",
        "left": "M527 835L543 846L551 919L561 991L546 968L536 913Z"
      }
    },
    "deep": false,
    "sources": [
      "S8"
    ],
    "kind": "muscleGroup"
  },
  {
    "id": "itBand",
    "tissue": "muscle",
    "zoom": "hip",
    "paths": {
      "F": {
        "right": "M365 822L382 827L378 915L391 980L382 997L367 952L357 914Z",
        "left": "M625 827L642 821L656 914L645 954L632 997L622 981L635 917Z"
      }
    },
    "deep": false,
    "sources": [
      "S9"
    ],
    "kind": "fascia"
  },
  {
    "id": "shin",
    "tissue": "muscle",
    "zoom": "lower",
    "paths": {
      "F": {
        "right": "M357 1090L373 1094L384 1150L374 1222L370 1288L361 1288L351 1180Z",
        "left": "M636 1094L651 1092L660 1178L650 1288L640 1288L637 1210L626 1152Z"
      }
    },
    "deep": false,
    "sources": [
      "S10"
    ],
    "kind": "muscleGroup"
  },
  {
    "id": "rhomboid",
    "tissue": "muscle",
    "zoom": "torso",
    "paths": {
      "B": {
        "left": "M450 382L487 366L487 467L462 482L441 441Z",
        "right": "M526 366L563 384L574 440L550 482L526 466Z"
      }
    },
    "deep": true,
    "sources": [
      "S2"
    ],
    "kind": "deepReference"
  },
  {
    "id": "lats",
    "tissue": "muscle",
    "zoom": "torso",
    "paths": {
      "B": {
        "left": "M394 465L427 465L448 510L446 569L430 654L397 672L391 599Z",
        "right": "M586 466L619 459L624 528L616 674L585 655L570 570L570 510Z"
      }
    },
    "deep": false,
    "sources": [
      "S2"
    ],
    "kind": "muscleGroup"
  },
  {
    "id": "erector",
    "tissue": "muscle",
    "zoom": "torso",
    "paths": {
      "B": {
        "left": "M467 503L486 493L489 672L472 688L458 630Z",
        "right": "M528 493L546 504L556 630L543 689L526 673Z"
      }
    },
    "deep": false,
    "sources": [
      "S4"
    ],
    "kind": "muscleGroup"
  },
  {
    "id": "rearDelt",
    "tissue": "muscle",
    "zoom": "arms",
    "paths": {
      "B": {
        "left": "M350 355L374 363L379 398L365 432L352 466L313 454L330 395Z",
        "right": "M640 355L663 366L686 401L701 454L664 466L648 430L634 397Z"
      }
    },
    "deep": false,
    "sources": [
      "S2"
    ],
    "kind": "muscleGroup"
  },
  {
    "id": "rotator",
    "tissue": "muscle",
    "zoom": "arms",
    "paths": {
      "B": {
        "left": "M396 383L429 377L444 412L431 441L395 431Z",
        "right": "M585 378L618 384L620 430L586 440L573 411Z"
      }
    },
    "deep": true,
    "sources": [
      "S1"
    ],
    "kind": "deepReference"
  },
  {
    "id": "triceps",
    "tissue": "muscle",
    "zoom": "arms",
    "paths": {
      "B": {
        "left": "M303 491L367 505L352 544L332 564L302 551Z",
        "right": "M650 506L710 492L714 545L692 564L665 548Z"
      }
    },
    "deep": false,
    "sources": [
      "S2"
    ],
    "kind": "muscleGroup"
  },
  {
    "id": "forearmE",
    "tissue": "muscle",
    "zoom": "arms",
    "paths": {
      "B": {
        "left": "M290 586L325 595L313 642L291 681L270 707L266 681L274 623Z",
        "right": "M691 597L723 589L738 628L745 682L729 707L708 654Z"
      }
    },
    "deep": false,
    "sources": [
      "S2"
    ],
    "kind": "muscleGroup"
  },
  {
    "id": "gluteMax",
    "tissue": "muscle",
    "zoom": "hip",
    "paths": {
      "B": {
        "left": "M394 807L435 787L483 805L478 851L459 883L403 884L375 853Z",
        "right": "M532 805L577 788L620 808L642 852L611 883L558 884L534 852Z"
      }
    },
    "deep": false,
    "sources": [
      "S8",
      "S11"
    ],
    "kind": "muscleGroup"
  },
  {
    "id": "gluteMed",
    "tissue": "muscle",
    "zoom": "hip",
    "paths": {
      "B": {
        "left": "M371 747L403 737L430 754L425 784L391 799L364 782Z",
        "right": "M585 754L609 738L638 749L649 780L624 800L589 784Z"
      }
    },
    "deep": false,
    "sources": [
      "S8",
      "S11"
    ],
    "kind": "muscleGroup"
  },
  {
    "id": "hamstrings",
    "tissue": "muscle",
    "zoom": "hip",
    "paths": {
      "B": {
        "left": "M380 909L455 908L451 964L435 1018L392 1014L373 968Z",
        "right": "M560 909L633 910L643 966L616 1016L576 1019L559 966Z"
      }
    },
    "deep": false,
    "sources": [
      "S3",
      "S8"
    ],
    "kind": "muscleGroup"
  },
  {
    "id": "calf",
    "tissue": "muscle",
    "zoom": "lower",
    "paths": {
      "B": {
        "left": "M363 1082L397 1080L427 1104L430 1152L415 1197L398 1224L374 1211L357 1154Z",
        "right": "M588 1084L624 1086L650 1133L651 1177L634 1216L608 1225L587 1188L578 1124Z"
      }
    },
    "deep": false,
    "sources": [
      "S3",
      "S8"
    ],
    "kind": "muscleGroup"
  },
  {
    "id": "achilles",
    "tissue": "muscle",
    "zoom": "lower",
    "paths": {
      "B": {
        "left": "M377 1236L394 1238L405 1291L381 1296Z",
        "right": "M615 1238L631 1236L645 1294L621 1296Z"
      }
    },
    "deep": false,
    "sources": [
      "S12"
    ],
    "kind": "tendon"
  },
  {
    "id": "jNeck",
    "tissue": "joint",
    "zoom": "neck",
    "paths": {
      "F": {
        "right": "M465 281a10 18 0 1 0 20 0a10 18 0 1 0 -20 0Z",
        "left": "M531 281a10 18 0 1 0 20 0a10 18 0 1 0 -20 0Z"
      },
      "B": {
        "left": "M466 278a11 21 0 1 0 22 0a11 21 0 1 0 -22 0Z",
        "right": "M527 278a11 21 0 1 0 22 0a11 21 0 1 0 -22 0Z",
        "center": "M498 279a9 21 0 1 0 18 0a9 21 0 1 0 -18 0Z"
      }
    },
    "deep": false,
    "sources": [
      "S5"
    ],
    "kind": "region"
  },
  {
    "id": "jShoulder",
    "tissue": "joint",
    "zoom": "arms",
    "paths": {
      "F": {
        "right": "M326 393a24 26 0 1 0 48 0a24 26 0 1 0 -48 0Z",
        "left": "M641 395a24 26 0 1 0 48 0a24 26 0 1 0 -48 0Z"
      },
      "B": {
        "left": "M328 400a23 26 0 1 0 46 0a23 26 0 1 0 -46 0Z",
        "right": "M641 400a23 26 0 1 0 46 0a23 26 0 1 0 -46 0Z"
      }
    },
    "deep": false,
    "sources": [
      "S1",
      "S6"
    ],
    "kind": "jointArea"
  },
  {
    "id": "jElbow",
    "tissue": "joint",
    "zoom": "arms",
    "paths": {
      "F": {
        "right": "M299 574a21 18 0 1 0 42 0a21 18 0 1 0 -42 0Z",
        "left": "M674 575a21 18 0 1 0 42 0a21 18 0 1 0 -42 0Z"
      },
      "B": {
        "left": "M299 577a20 18 0 1 0 40 0a20 18 0 1 0 -40 0Z",
        "right": "M677 578a20 18 0 1 0 40 0a20 18 0 1 0 -40 0Z"
      }
    },
    "deep": false,
    "sources": [
      "S6"
    ],
    "kind": "jointArea"
  },
  {
    "id": "jWrist",
    "tissue": "joint",
    "zoom": "arms",
    "paths": {
      "F": {
        "right": "M246 738a16 16 0 1 0 32 0a16 16 0 1 0 -32 0Z",
        "left": "M735 739a16 16 0 1 0 32 0a16 16 0 1 0 -32 0Z"
      },
      "B": {
        "left": "M247 744a15 15 0 1 0 30 0a15 15 0 1 0 -30 0Z",
        "right": "M737 744a15 15 0 1 0 30 0a15 15 0 1 0 -30 0Z"
      }
    },
    "deep": false,
    "sources": [
      "S6"
    ],
    "kind": "jointArea"
  },
  {
    "id": "jHand",
    "tissue": "joint",
    "zoom": "arms",
    "paths": {
      "F": {
        "right": "M247 802a13 22 0 1 0 26 0a13 22 0 1 0 -26 0Z",
        "left": "M738 802a13 22 0 1 0 26 0a13 22 0 1 0 -26 0Z"
      },
      "B": {
        "left": "M247 804a13 22 0 1 0 26 0a13 22 0 1 0 -26 0Z",
        "right": "M739 804a13 22 0 1 0 26 0a13 22 0 1 0 -26 0Z"
      }
    },
    "deep": false,
    "sources": [
      "S6"
    ],
    "kind": "region"
  },
  {
    "id": "jThoracic",
    "tissue": "joint",
    "zoom": "torso",
    "paths": {
      "B": {
        "left": "M468 444a11 43 0 1 0 22 0a11 43 0 1 0 -22 0Z",
        "right": "M527 444a11 43 0 1 0 22 0a11 43 0 1 0 -22 0Z",
        "center": "M498 444a10 43 0 1 0 20 0a10 43 0 1 0 -20 0Z"
      }
    },
    "deep": false,
    "sources": [
      "S5"
    ],
    "kind": "region"
  },
  {
    "id": "jLumbar",
    "tissue": "joint",
    "zoom": "torso",
    "paths": {
      "B": {
        "left": "M465 623a12 36 0 1 0 24 0a12 36 0 1 0 -24 0Z",
        "right": "M527 623a12 36 0 1 0 24 0a12 36 0 1 0 -24 0Z",
        "center": "M498 623a10 36 0 1 0 20 0a10 36 0 1 0 -20 0Z"
      }
    },
    "deep": false,
    "sources": [
      "S5"
    ],
    "kind": "region"
  },
  {
    "id": "jSI",
    "tissue": "joint",
    "zoom": "hip",
    "paths": {
      "B": {
        "left": "M453 755a17 19 0 1 0 34 0a17 19 0 1 0 -34 0Z",
        "right": "M529 755a17 19 0 1 0 34 0a17 19 0 1 0 -34 0Z"
      }
    },
    "deep": false,
    "sources": [
      "S13"
    ],
    "kind": "jointArea"
  },
  {
    "id": "jHip",
    "tissue": "joint",
    "zoom": "hip",
    "paths": {
      "F": {
        "right": "M393 797a26 26 0 1 0 52 0a26 26 0 1 0 -52 0Z",
        "left": "M569 798a26 26 0 1 0 52 0a26 26 0 1 0 -52 0Z"
      }
    },
    "deep": false,
    "sources": [
      "S14"
    ],
    "kind": "jointArea"
  },
  {
    "id": "jKnee",
    "tissue": "joint",
    "zoom": "lower",
    "paths": {
      "F": {
        "right": "M385 1038a27 27 0 1 0 54 0a27 27 0 1 0 -54 0Z",
        "left": "M575 1039a27 27 0 1 0 54 0a27 27 0 1 0 -54 0Z"
      },
      "B": {
        "left": "M385 1042a26 27 0 1 0 52 0a26 27 0 1 0 -52 0Z",
        "right": "M577 1043a26 27 0 1 0 52 0a26 27 0 1 0 -52 0Z"
      }
    },
    "deep": false,
    "sources": [
      "S6"
    ],
    "kind": "jointArea"
  },
  {
    "id": "jAnkle",
    "tissue": "joint",
    "zoom": "lower",
    "paths": {
      "F": {
        "right": "M373 1290a17 17 0 1 0 34 0a17 17 0 1 0 -34 0Z",
        "left": "M611 1290a17 17 0 1 0 34 0a17 17 0 1 0 -34 0Z"
      },
      "B": {
        "left": "M372 1292a16 17 0 1 0 32 0a16 17 0 1 0 -32 0Z",
        "right": "M613 1292a16 17 0 1 0 32 0a16 17 0 1 0 -32 0Z"
      }
    },
    "deep": false,
    "sources": [
      "S6",
      "S12"
    ],
    "kind": "jointArea"
  },
  {
    "id": "jFoot",
    "tissue": "joint",
    "zoom": "lower",
    "paths": {
      "F": {
        "right": "M337 1363a34 27 0 1 0 68 0a34 27 0 1 0 -68 0Z",
        "left": "M610 1364a34 27 0 1 0 68 0a34 27 0 1 0 -68 0Z"
      },
      "B": {
        "left": "M337 1364a33 27 0 1 0 66 0a33 27 0 1 0 -66 0Z",
        "right": "M611 1365a33 27 0 1 0 66 0a33 27 0 1 0 -66 0Z"
      }
    },
    "deep": false,
    "sources": [
      "S3",
      "S6"
    ],
    "kind": "region"
  }
];
export const sorenessZooms = {full:'0 0 1024 1536',neck:'270 185 480 270',arms:'200 300 620 600',torso:'335 310 350 460',hip:'320 700 390 430',lower:'280 980 460 460'} as const;
export const sorenessBackLine = 'M438 124Q502 139 565 124M451 275Q505 298 557 275M441 303Q505 325 572 303M376 355Q361 397 374 480M639 355Q653 397 639 480M291 472Q328 492 373 492M640 492Q685 492 721 472M375 714Q506 749 638 714M376 723L349 914Q411 938 484 918L507 830L530 918Q602 938 664 914L638 723M507 749L507 815M375 1008Q407 1028 446 1011M568 1011Q606 1028 638 1008M360 1315Q390 1324 418 1315M598 1315Q627 1324 657 1315';
