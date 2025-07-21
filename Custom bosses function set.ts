globalThis.bosses = {"Amerite Gladiator" : {drops : [{itemName: "Red Paintball", probabilityOfDrop: 0.2, dropMinAmount: 1, dropMaxAmount: 1}, {itemName: "Knight Heart", probabilityOfDrop: 1, dropMinAmount: 1, dropMaxAmount: 1}], hp : 2000, damage : 70, effects : [{effectName : "Frozen", effectDuration : 5000, effectCooldown : 20000, level : 1}], realMob : "Draugr Knight", chestPos : [-97.5, 22, 17.5]}, "Golem of the Deepcore" : {drops : [{itemName: "Red Paintball", probabilityOfDrop: 0.2, dropMinAmount: 1, dropMaxAmount: 1}, {itemName: "Golem Eye", probabilityOfDrop: 1, dropMinAmount: 1, dropMaxAmount: 1}], hp : 2000, damage : 150, effects : [{effectName : "Poisoned", effectDuration : 3000, effectCooldown : 10000, level : 1}, {effectName : "Weakness", effectDuration : 3000, effectCooldown : 10000, level : 1}], realMob : "Cave Golem", chestPos : [-97.5, 23, 17.5]}}

function summon(name, pos) {
	if (bosses[name] == null) {
		api.broadcastMessage("This boss doesn't exist", {color : "red"})
		return true
	}
	var a = api.attemptSpawnMob(bosses[name].realMob, pos[0], pos[1], pos[2])
	if (a) {
		var boss = bosses[name]
		api.setBlock(boss.chestPos[0], boss.chestPos[1], boss.chestPos[2], "Air")
		api.setBlock(boss.chestPos[0], boss.chestPos[1], boss.chestPos[2], "Chest")
		api.setMobSetting(a, "name", name)
		api.setMobSetting(a, "maxHealth", boss.hp)
		api.setMobSetting(a, "attackDamage", boss.damage)
		api.setMobSetting(a, "onDeathItemDrops", boss.drops)
		api.setHealth(a, boss.hp)
		//api.log(api.getHealth(a))
	} else {
		api.broadcastMessage("An unexpected error occured while attempting to spawn the " + name + ", please retry or contact dulph or your server admin", {color : "red"})
	}
	return a
}

function playerCommand(playerId, command) {
	if (command.includes("summon")) {
		var commandName = ""
		var counter = 0
		while (command[counter] != " " && counter < command.length) {
			commandName += command[counter]
			counter++
		}
		var boss = ""
		counter++
		while (counter < command.length) {
			boss+= command[counter]
			counter++
		}
		if (!summon(boss, api.getPosition(playerId))) {
			api.sendMessage(playerId, "An unexpected error has occured", {color:"red"})
		}
		return true
	}
}

function onMobDamagingPlayer(attackingMob, damagedPlayer, damageDealt, withItem) {
	var boss = bosses[api.getEntityName(attackingMob)]
	if (boss != null) {
		
		var effects = boss.effects
		if (effects != null) {
			var counter = 0
			while (counter < effects.length) {
				if (api.getStandardChestItemSlot(boss.chestPos, counter) == null || Date.now() - api.getStandardChestItemSlot(boss.chestPos, counter).attributes.customAttributes.lastUsed > effects[counter].effectCooldown) {
					api.applyEffect(damagedPlayer, effects[counter].effectName, effects[counter].effectDuration, {icon:"Frozen", displayName : effects[counter].effectName, inbuiltLevel : effects[counter].level})
					api.setStandardChestItemSlot(boss.chestPos, counter, "Black Carpet", 1, damagedPlayer, {customAttributes : {lastUsed : Date.now()}, customDisplayName : api.getEntityName(attackingMob)})
				}
				counter++
			}
		}

	}
}
