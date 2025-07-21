The bosses declaration at the start of world code should have this format :

`{"Boss name" : {drops : [{itemName: "1st item name", probabilityOfDrop: "probability of item droping", dropMinAmount: "minimum amount", dropMaxAmount: "maximum amount"}], hp: "bosse's hp", damage: "bosse's damage", effects : [{effectName : "effect ID", effectDuration : "effect duration", effectCooldown : "effect cooldown", value : "effect custom value"}], realMob : "what's that mob", chestPos : ["x", "y", "z"]}}`

- Boss name (string) is the boss' name, displayed over his head
	- drops (Array<object>) is the boss' drops on death
		- itemName (string) is the item dropped
		- probabilityOfDrop (real) shold be a number in ]0; 1] representing the chance of the item dropping, with 1 being 100% chance and 0 being no drop at all
		- dropMinAmount (integer) is the minimum possible drop of this item
		- dropMaxAmount (integer) should be >= than dropMinAmount and is the maximum possible drop of the item
	- hp (integer) is the boss' hp
	- damage (integer) is the damage the boss will do on a non-armored players
	- effects (Array<object>) are the effects the boss will apply on hit target
		- effectName (string) must be a valid effect ID
		- effectDuration (integer) is the duration of the effect on the target, in ms
		- level (integer) is the effect's level
	- realMob (string) must be a valid mob ID and represents the mob's appearance
	- chestPos (Array<real|integer>) is a position where a chest will be placed to retain the mob effect's cooldowns as such : [x.5, y, z.5]
		- x (integer) is the x position of the chest
		- y (integer) is the y position of the chest
		- z (integer) is the z position of the chest

Example:
`{"Amerite Gladiator" : {drops : [{itemName: "Red Paintball", probabilityOfDrop: 0.2, dropMinAmount: 1, dropMaxAmount: 5}, {itemName: "Knight Heart", probabilityOfDrop: 1, dropMinAmount: 1, dropMaxAmount: 1}], hp : 2000, damage : 70, effects : [{effectName : "Frozen", effectDuration : 5000, effectCooldown : 20000, level : 1}], realMob : "Draugr Knight", chestPos : [-97.5, 22, 17.5]}}`

We have here a mob called the Amerite Gladiator (Id) which on death drops 1 (`id.drops[0].dropMinAmount`) to 5 (`id.drops[0].dropMinAmount`) Red Paintball (`id.drops[0].itemName`) with a 20% chance (`id.drops[0].probabilityOfDrop`). It has 2000 hp (`id.hp`) and does 70 (`id.damage`) damage to a non-armored player. On hit, it applies the Frozen effect (`id.effects[0].effectName`), level 1 (`id.effects[0].level`), for 5s (`id.effects[0].effectDuration`) with a 20s (`id.effects[0].effectCooldown`) cooldown. It looks like a Draugr Knight (`id.realMob`). The effect cooldown are stored in a chest at -97.5, 22, 17.5 (`id.chestPos`).

Recap: We have a Draugr Knight called the Amerite Gladiator, which on death has a 20% chance of dropping 1 to 5 Red Paintball. It has 2000 hp and does 70 damage to non-armored players. On hit it applies the Frozen effect for 5s with a 20s cooldown. The cooldown is stored in a chest at -97.5, 22, 17.5.

Note : The boss can be summoned in a code block, using summon(bossID, pos) where bossID must be a valid boss defined in World Code and pos (Array<real>) is the coordinates where the boss will be summoned as \[x, y, z]. It can also be summoned using /summon <bossID> which will summon it at the person using the command's location.
