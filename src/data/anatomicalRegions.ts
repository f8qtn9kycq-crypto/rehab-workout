/** Source: https://github.com/f8qtn9kycq-crypto/rehab-workout/issues/226#issuecomment-6249339084
 * Static observation targets from issue #226's original SVG; not diagnostic boundaries. */
export type AnatomicalZoom = 'neck' | 'arms' | 'torso' | 'hip' | 'lower';
export type AnatomicalShape = {
  readonly view: 'F' | 'B' | 'FB';
  readonly path?: string;
  readonly ellipse?: readonly number[];
};
export const anatomicalRegions = [
  {
    "id": "scm",
    "tissue": "muscle",
    "shapes": [
      {
        "view": "F",
        "ellipse": [
          104,
          58,
          5,
          9
        ]
      }
    ],
    "zoom": "neck"
  },
  {
    "id": "traps",
    "tissue": "muscle",
    "shapes": [
      {
        "view": "F",
        "path": "M108 62C122 65 138 68 150 76L142 86C130 80 118 74 108 72Z"
      },
      {
        "view": "B",
        "path": "M101 60C116 64 134 68 148 78L138 94C124 92 110 86 101 90Z"
      }
    ],
    "zoom": "neck"
  },
  {
    "id": "chest",
    "tissue": "muscle",
    "shapes": [
      {
        "view": "F",
        "path": "M102 82C116 78 130 84 140 92L139 112C128 122 112 122 102 116Z"
      }
    ],
    "zoom": "torso"
  },
  {
    "id": "deltoid",
    "tissue": "muscle",
    "shapes": [
      {
        "view": "F",
        "path": "M144 80C156 78 162 90 161 104C160 112 152 114 146 110C142 100 140 88 144 80Z"
      }
    ],
    "zoom": "arms"
  },
  {
    "id": "biceps",
    "tissue": "muscle",
    "shapes": [
      {
        "view": "F",
        "path": "M146 112C153 112 158 118 160 130L163 148C158 152 152 150 150 148C148 136 146 124 146 112Z"
      }
    ],
    "zoom": "arms"
  },
  {
    "id": "forearmF",
    "tissue": "muscle",
    "shapes": [
      {
        "view": "F",
        "path": "M150 152C157 152 164 154 168 160L180 210C176 214 168 214 164 212C158 192 152 172 150 152Z"
      }
    ],
    "zoom": "arms"
  },
  {
    "id": "abs",
    "tissue": "muscle",
    "shapes": [
      {
        "view": "F",
        "path": "M102 122C116 122 124 128 126 140L127 176C122 190 110 192 102 190Z"
      }
    ],
    "zoom": "torso"
  },
  {
    "id": "obliques",
    "tissue": "muscle",
    "shapes": [
      {
        "view": "F",
        "path": "M127 128C134 126 138 122 139 116C138 140 134 160 132 178C129 184 127 184 127 178Z"
      }
    ],
    "zoom": "torso"
  },
  {
    "id": "hipFlexor",
    "tissue": "muscle",
    "shapes": [
      {
        "view": "F",
        "path": "M102 192C116 192 128 190 134 196C138 204 138 214 136 220C124 224 112 222 102 222Z"
      }
    ],
    "zoom": "hip"
  },
  {
    "id": "quads",
    "tissue": "muscle",
    "shapes": [
      {
        "view": "F",
        "path": "M112 224C122 224 130 223 133 226C136 248 135 272 133 298C126 304 118 304 112 298C110 270 110 245 112 224Z"
      }
    ],
    "zoom": "hip"
  },
  {
    "id": "adductors",
    "tissue": "muscle",
    "shapes": [
      {
        "view": "F",
        "path": "M102 224L111 226C110 250 110 275 109 298C106 298 104 280 103 262C102 250 101 238 102 224Z"
      }
    ],
    "zoom": "hip"
  },
  {
    "id": "itBand",
    "tissue": "muscle",
    "shapes": [
      {
        "view": "F",
        "path": "M133 226C137 224 141 222 141 226C142 250 140 276 137 298C136 300 134 300 133 298C135 272 136 248 133 226Z"
      }
    ],
    "zoom": "hip"
  },
  {
    "id": "shin",
    "tissue": "muscle",
    "shapes": [
      {
        "view": "F",
        "path": "M114 328C122 326 130 326 132 330C133 350 132 370 130 388C124 390 118 390 114 388C112 370 112 348 114 328Z"
      }
    ],
    "zoom": "lower"
  },
  {
    "id": "rhomboid",
    "tissue": "muscle",
    "shapes": [
      {
        "view": "B",
        "path": "M102 96C110 96 118 98 126 102L124 126C116 130 108 128 102 128Z"
      }
    ],
    "zoom": "torso"
  },
  {
    "id": "lats",
    "tissue": "muscle",
    "shapes": [
      {
        "view": "B",
        "path": "M132 128C138 128 139 118 139 116C138 140 134 162 131 176C122 180 114 176 112 170C116 156 122 140 132 128Z"
      }
    ],
    "zoom": "torso"
  },
  {
    "id": "erector",
    "tissue": "muscle",
    "shapes": [
      {
        "view": "B",
        "path": "M101 130C108 130 112 140 114 156C114 170 112 182 108 192L101 196Z"
      }
    ],
    "zoom": "torso"
  },
  {
    "id": "rearDelt",
    "tissue": "muscle",
    "shapes": [
      {
        "view": "B",
        "path": "M144 80C156 78 162 90 161 104C160 112 152 114 146 110C142 100 140 88 144 80Z"
      }
    ],
    "zoom": "arms"
  },
  {
    "id": "rotator",
    "tissue": "muscle",
    "shapes": [
      {
        "view": "B",
        "path": "M126 90C134 88 140 90 141 96L139 108C134 110 128 108 126 104Z"
      }
    ],
    "zoom": "arms"
  },
  {
    "id": "triceps",
    "tissue": "muscle",
    "shapes": [
      {
        "view": "B",
        "path": "M146 106C153 108 158 114 160 128L164 148C158 152 152 150 150 146C148 134 146 120 146 106Z"
      }
    ],
    "zoom": "arms"
  },
  {
    "id": "forearmE",
    "tissue": "muscle",
    "shapes": [
      {
        "view": "B",
        "path": "M150 152C157 152 164 154 168 160L180 210C176 214 168 214 164 212C158 192 152 172 150 152Z"
      }
    ],
    "zoom": "arms"
  },
  {
    "id": "gluteMax",
    "tissue": "muscle",
    "shapes": [
      {
        "view": "B",
        "path": "M101 196C114 190 130 192 138 202C142 214 138 226 130 232C118 236 108 232 101 226Z"
      }
    ],
    "zoom": "hip"
  },
  {
    "id": "gluteMed",
    "tissue": "muscle",
    "shapes": [
      {
        "view": "B",
        "path": "M118 190C128 188 136 192 140 198C140 202 136 204 130 200C124 196 120 194 118 190Z"
      }
    ],
    "zoom": "hip"
  },
  {
    "id": "hamstrings",
    "tissue": "muscle",
    "shapes": [
      {
        "view": "B",
        "path": "M104 236C114 236 128 236 136 234C140 256 138 280 134 298C124 304 114 304 108 298C106 276 104 254 104 236Z"
      }
    ],
    "zoom": "hip"
  },
  {
    "id": "calf",
    "tissue": "muscle",
    "shapes": [
      {
        "view": "B",
        "path": "M112 322C122 320 132 322 135 328C139 346 136 364 130 376C124 380 118 380 114 376C110 360 110 340 112 322Z"
      }
    ],
    "zoom": "lower"
  },
  {
    "id": "achilles",
    "tissue": "muscle",
    "shapes": [
      {
        "view": "B",
        "path": "M118 378C122 380 126 380 128 378L127 394C124 396 121 396 119 394Z"
      }
    ],
    "zoom": "lower"
  },
  {
    "id": "jNeck",
    "tissue": "joint",
    "shapes": [
      {
        "view": "FB",
        "ellipse": [
          104,
          57,
          8,
          9
        ]
      }
    ],
    "zoom": "neck"
  },
  {
    "id": "jShoulder",
    "tissue": "joint",
    "shapes": [
      {
        "view": "FB",
        "ellipse": [
          152,
          90,
          11,
          11
        ]
      }
    ],
    "zoom": "arms"
  },
  {
    "id": "jElbow",
    "tissue": "joint",
    "shapes": [
      {
        "view": "FB",
        "ellipse": [
          160,
          158,
          9,
          10
        ]
      }
    ],
    "zoom": "arms"
  },
  {
    "id": "jWrist",
    "tissue": "joint",
    "shapes": [
      {
        "view": "FB",
        "ellipse": [
          174,
          222,
          7,
          7
        ]
      }
    ],
    "zoom": "arms"
  },
  {
    "id": "jHand",
    "tissue": "joint",
    "shapes": [
      {
        "view": "FB",
        "ellipse": [
          178,
          243,
          8,
          10
        ]
      }
    ],
    "zoom": "arms"
  },
  {
    "id": "jThoracic",
    "tissue": "joint",
    "shapes": [
      {
        "view": "B",
        "ellipse": [
          108,
          112,
          9,
          18
        ]
      }
    ],
    "zoom": "torso"
  },
  {
    "id": "jLumbar",
    "tissue": "joint",
    "shapes": [
      {
        "view": "B",
        "ellipse": [
          106,
          166,
          10,
          13
        ]
      }
    ],
    "zoom": "torso"
  },
  {
    "id": "jSI",
    "tissue": "joint",
    "shapes": [
      {
        "view": "B",
        "ellipse": [
          112,
          192,
          9,
          8
        ]
      }
    ],
    "zoom": "hip"
  },
  {
    "id": "jHip",
    "tissue": "joint",
    "shapes": [
      {
        "view": "F",
        "ellipse": [
          126,
          202,
          12,
          12
        ]
      }
    ],
    "zoom": "hip"
  },
  {
    "id": "jKnee",
    "tissue": "joint",
    "shapes": [
      {
        "view": "FB",
        "ellipse": [
          122,
          310,
          12,
          12
        ]
      }
    ],
    "zoom": "lower"
  },
  {
    "id": "jAnkle",
    "tissue": "joint",
    "shapes": [
      {
        "view": "FB",
        "ellipse": [
          122,
          387,
          9,
          7
        ]
      }
    ],
    "zoom": "lower"
  },
  {
    "id": "jFoot",
    "tissue": "joint",
    "shapes": [
      {
        "view": "FB",
        "ellipse": [
          126,
          400,
          13,
          5
        ]
      }
    ],
    "zoom": "lower"
  }
] as const satisfies readonly {
  readonly id: string;
  readonly tissue: 'muscle' | 'joint';
  readonly shapes: readonly AnatomicalShape[];
  readonly zoom: AnatomicalZoom;
}[];
export type AnatomicalRegionId = (typeof anatomicalRegions)[number]['id'];
/** Mirror this half around x=100. Head ellipse: cx=100, cy=27, rx=17, ry=22. */
export const bodyOutline = "M108 46L108 62C122 65 138 67 149 75C157 80 161 90 161 102C163 122 167 142 171 160C173 178 179 198 184 216C187 226 188 236 184 244C181 252 175 254 172 247C168 238 165 226 162 214C157 196 152 178 149 160C147 146 143 128 140 108C139 124 133 146 131 166C131 182 139 196 141 214C142 244 141 272 138 304C137 316 138 324 137 332C140 350 141 366 137 384C136 392 136 396 135 400C141 402 147 403 146 407L108 407C109 400 110 394 111 386C112 368 113 350 112 336C110 326 108 316 107 306C105 280 103 252 101 226L100 222";
export const zoomViewBoxes = {
  full: '0 0 200 410', neck: '30 35 140 100', arms: '5 95 190 165',
  torso: '40 95 120 140', hip: '40 185 120 150', lower: '40 290 120 120',
} as const;
