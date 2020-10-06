// bot
class Bot {
  currentMob = { x: 0, y: 0 };
  active = false;
  minLvl = 1;
  maxLvl = 2;
  wantLoots = false;
  inBattle = false;
  time = 1200;
  takeLoot = false;

  start() {
    this.active = true;
    // find Mob
    this.findMob();
    return "Let's go!!!";
  }

  stop() {
    this.active = false;
    return "Okay man, i will stop!!!";
  }

  showCurrentMob() {
    return this.currentMob;
  }

  setSettings(min, max, loot) {
    this.minLvl = min;
    this.maxLvl = max;
    this.takeLoot = loot;
  }

  findMob() {
    if (!this.active) return;

    const mobs = Object.values(Engine.npcs.check())
      .filter(
        (mob) =>
          (mob.d.type == 2 || mob.d.type == 3) &&
          mob.d.lvl >= this.minLvl &&
          mob.d.lvl <= this.maxLvl
      )
      .map(({ d: { x, y } }) => {
        const coords = { x, y };
        return coords;
      });

    const { x: playerX, y: playerY } = Engine.hero.d;
    const player = { x: playerX, y: playerY };
    this.currentMob = mobs[0];
    mobs.forEach((mob) => {
      if (
        this.countDistance(mob, player) <
        this.countDistance(this.currentMob, player)
      ) {
        this.currentMob = mob;
      }
    });

    // go to Mob
    this.goToMob();
  }

  countDistance({ x: x1, y: y1 }, { x: x2, y: y2 }) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  goToMob() {
    console.log("GO TO MOB");
    Engine.hero.autoGoTo(this.currentMob);

    const repeat = setInterval(() => {
      const { x: playerX, y: playerY } = Engine.hero.d;
      const player = { x: playerX, y: playerY };
      const mob = this.currentMob;
      if (this.countDistance(player, mob) <= 2 && !this.inBattle) {
        console.log(this.countDistance(player, mob));
        this.attackMob();
        clearInterval(repeat);
      }
    }, this.time);
  }

  attackMob() {
    console.log("ATTACK");
    Engine.hero.atackNearMob();
    this.inBattle = true;

    //skip battle
    setTimeout(() => this.skipBattle(), this.time);
  }

  skipBattle() {
    console.log("SKIPED");
    Engine.battle.canAutoFight();
    // leave Battle
    setTimeout(() => this.leaveBattle(), this.time);
  }

  leaveBattle() {
    if (Engine.battle.canLeaveBattle && this.inBattle) {
      this.leaveBattle();
      return;
    }

    console.log("LEFT BATTLE");
    Engine.battle.leaveBattle();
    this.inBattle = false;
    //takeLoot again
    setTimeout(() => this.takeLoots(), this.time);
  }

  takeLoots() {
    if (!this.takeLoot) {
      Engine.loots.refuseAllLoot();
      console.log("REFUSED LOOT");
    }
    Engine.loots.acceptLoot();
    console.log("TOOK LOOT");
    //let's find mob again :)
    setTimeout(() => this.findMob(), this.time);
  }
}

const MargoBot = new Bot();

//popup;

window.addEventListener("load", createPopup);

function createPopup() {
  const popup = `
  <div class="bot-popup">
  <h1 class="bot-popup__h1">NoNamedCobble's Bot</h1>
  <form class="form">
  Min Lvl:<input type="number" class="form__inputMin" value="1" />
  Max Lvl:<input type="number" class="form__inputMax" value="100"/>
  Take loot:<input type="checkbox" class="form__loot">
  <button class="form__button">START</button>
</form>
</div>
  `;

  setTimeout(() => {
    document.body.insertAdjacentHTML("beforeend", popup);
    document.querySelector(".form").addEventListener("submit", (event) => {
      event.preventDefault();
      handleClick();
    });
  }, 5000);
}

function handleClick() {
  const btn = document.querySelector(".form__button");
  if (btn.classList.toggle("active")) {
    btn.textContent = "STOP";
    const inputMin = document.querySelector(".form__inputMin").value * 1;
    const inputMax = document.querySelector(".form__inputMin").value * 1;
    const boxLoot = document.querySelector(".form__loot");
    MargoBot.setSettings(inputMin, inputMax, boxLoot.checked);
    MargoBot.start();
  } else {
    btn.textContent = "START";
    MargoBot.stop();
  }
}
