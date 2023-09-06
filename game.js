kaboom({
  global: true,
  fullscreen: true,
  scale: 1,
  debug: true,
  clearColor: [0, 0, 0, 1],
});

const MOVE_SPEED = 120;

loadRoot("sprite/");
loadSprite("link-going-left", "linkGoingLeft.png");
loadSprite("link-going-right", "linkGoingright.png");
loadSprite("link-going-down", "linkgoindown.png");
loadSprite("link-going-up", "linkgoingup.png");
loadSprite("left-wall", "leftwall.png");
loadSprite("top-wall", "topwall.png");
loadSprite("bottom-wall", "bottomwall.png");
loadSprite("right-wall", "rightwall.png");
loadSprite("bottom-left-wall", "bottomleft.png");
loadSprite("bottom-right-wall", "bottomright.png");
loadSprite("top-left-wall", "topleft.png");
loadSprite("top-right-wall", "topright.jpg");
loadSprite("top-door", "door.png");
loadSprite("fire-pot", "firepot.png");
loadSprite("left-door", "doorleft.png");
loadSprite("lanterns", "lanterns.png");
loadSprite("slicer", "slicer.png");
loadSprite("skeletor", "skeletor.png");
loadSprite("kaboom", "kaboom.png");
loadSprite("stairs", "stairs.png");
loadSprite("bg", "bg.png");

scene("game", ({ level, score }) => {
  layers(["bg", "obj", "ui"], "obj");

  const maps = [
    [
      "ycc)cc^ccw",
      "a        b",
      "a     *  b",
      "a        b",
      "%   }  ( b",
      "a      ( b",
      "a        b",
      "a     *  b",
      "a        b",
      "xdd)dd)ddz",
    ],

    [
      "ycc)cccccw",
      "a        b",
      "a        b",
      "a        b",
      "%        )",
      "a        b",
      "a        b",
      "a      $ )",
      "a        b",
      "xdd)dd)ddz",
    ],
  ];

  const levelCfg = {
    width: 48,
    height: 48,
    a: [sprite("left-wall"), solid(), "wall"],
    c: [sprite("top-wall"), solid(), "wall"],
    d: [sprite("bottom-wall"), solid(), "wall"],
    b: [sprite("right-wall"), solid(), "wall"],
    x: [sprite("bottom-left-wall"), solid(), "wall"],
    z: [sprite("bottom-right-wall"), solid(), "wall"],
    y: [sprite("top-left-wall"), solid(), "wall"],
    w: [sprite("top-right-wall"), solid(), "wall"],
    "^": [sprite("top-door"), "next-level", "door"],
    "(": [sprite("fire-pot"), solid(), "wall"],
    "%": [sprite("left-door"), "next-level", "door"],
    ")": [sprite("lanterns"), solid(), "wall"],
    "*": [sprite("slicer"), "slicer", { dir: -1 }, "dangerous"],
    "}": [sprite("skeletor"), "dangerous", "skeletor", { dir: -1, timer: 0 }],
    $: [sprite("stairs"), "next-level"],
  };
  addLevel(maps[level], levelCfg);

  add([sprite("bg"), layer("bg")]);
  const scoreLabel = add([
    text("0"),
    pos(220, 550),
    layer("ui"),
    {
      value: score,
    },
    scale(4),
  ]);
  add([text("level " + parseInt(level + 1)), pos(160, 500), scale(4)]);

  const player = add([
    sprite("link-going-right"),
    pos(50, 190),
    {
      dir: vec2(1, 0),
    },
  ]);

  player.action(() => {
    player.resolve();
  });

  player.overlaps("next-level", () => {
    go("game", {
      level: level + 1,
      score: scoreLabel.value,
    });
  });

  keyDown("left", () => {
    player.changeSprite("link-going-left");
    player.move(-MOVE_SPEED, 0);
    player.dir = vec2(-1, 0);
  });

  keyDown("right", () => {
    player.changeSprite("link-going-right");
    player.move(MOVE_SPEED, 0);
    player.dir = vec2(1, 0);
  });

  keyDown("up", () => {
    player.changeSprite("link-going-up");
    player.move(0, -MOVE_SPEED);
    player.dir = vec2(0, -1);
  });

  keyDown("down", () => {
    player.changeSprite("link-going-down");
    player.move(0, MOVE_SPEED);
    player.dir = vec2(0, 1);
  });

  function spawnKaboom(p) {
    const obj = add([sprite("kaboom"), pos(p), "kaboom"]);
    wait(0.1, () => {
      destroy(obj);
    });
  }
  keyPress("space", () => {
    spawnKaboom(player.pos.add(player.dir.scale(48)));
  });

  player.collides("door", (d) => {
    destroy(d);
  });

  collides("kaboom", "skeletor", (k, s) => {
    camShake(4);
    wait(1, () => {
      destroy(k);
    });
    destroy(s);
    scoreLabel.value++;
    scoreLabel.text = scoreLabel.value;
  });
  const SLICER_SPEED = 100;

  action("slicer", (s) => {
    s.move(s.dir * SLICER_SPEED, 0);
  });

  collides("slicer", "wall", (s) => {
    s.dir = -s.dir;
  });

  const SKELETOR_SPEED = 60;
  action("skeletor", (s) => {
    s.move(0, s.dir * SKELETOR_SPEED);
    s.timer -= dt();
    if (s.timer <= 0) {
      s.dir = -s.dir;
      s.timer = rand(5);
    }
  });

  collides("skeletor", "wall", (s) => {
    s.dir = -s.dir;
  });

  player.overlaps("dangerous", () => {
    go("lose", { score: scoreLabel.value });
  });
});

scene("lose", ({ score }) => {
  add([text(score, 32), origin("center"), pos(width() / 2, height() / 2)]);
});

start("game", { level: 0, score: 0 });
