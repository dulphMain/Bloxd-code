//This defines every custom item, its craft recipe and its abilities, also if it is unique, its name...
globalThis.craftingRecipes = {"Frozen Sword" : {items : {"Ice":10, "Knight Heart" : 2}, "crafted" : false, "isUniqueItem" : true, attributes : {customDisplayName: "Frozen Sword", customAttributes: {customEffects: [{effectName: "Frozen", effectDuration: 10000, effectCooldown : 20000, lastUsedEffect : 0, value : 1}]}}, "item" : "Knight Sword"}, "Poison Sword" : {items : {"Iron Bar":2, "Arrow of Poison" : 10, "Vines":5}, "crafted" : false, "isUniqueItem" : true, attributes : {customDisplayName: "Poison Sword", customAttributes: {customEffects: [{effectName: "Poisoned", effectDuration: 5000, effectCooldown : 20000, lastUsedEffect : 0, value : 1}]}}, "item" : "Iron Sword"}, "Excalibur" : {"items" : {"Block of Gold" : 10, "Instant Damage Potion II" : 3, "Knight Heart" : 1}, "crafted" : false, "isUniqueItem" : true, attributes : {customDisplayName: "Excalibur", customAttributes: {customEffects: [{effectName: "Lifesteal", effectDuration: 5, effectCooldown : 30000, lastUsedEffect : 0, value : 5}]}}, "item" : "Gold Sword"}, "Teleportation Bow" : {items : {"Moonstone Orb" : 3, "Knockback Potion" : 2, "Melon Slice" : 1}, "crafted" : false, isUniqueItem : true, attributes : {customDisplayName: "Teleportation Bow", customAttributes: {customEffects: [{effectName: "Swap", effectDuration: 0, effectCooldown : 10000, lastUsedEffect : 0, value : 1}]}}, item : "Iron Bow"}, "Totem" : {items : {"Block of Gold" : 6, "Apple" : 23, "Gold Gauntlets" : 1}, "crafted" : false, isUniqueItem : false, attributes : {customDisplayName: "Totem"}, item : "Gold Gauntlets"}}

function onPlayerDamagingOtherPlayer(attackingPlayer, damagedPlayer, damageDealt, withItem, bodyPartHit, damagerDbId) {
	//Totem code is from MrPants
	const held = api.getItemSlot(damagedPlayer, 48)
	const currentHealth = api.getHealth(damagedPlayer);
	const remainingHealth = currentHealth - damageDealt;
	if (remainingHealth <= 0 && held.attributes?.customDisplayName === "Totem") {
		// Restore health to full
		api.setHealth(damagedPlayer, 20);
		api.setShieldAmount(damagedPlayer, 20 + damageDealt);
		
		// Apply regeneration effect
		api.applyEffect(damagedPlayer, "Health Regen", 20000, { inbuiltLevel: 2 });
		api.setItemSlot(damagedPlayer, 48, "Air", 1)
		// Play 5x5 particle explosion at player's position
		const [x, y, z] = api.getPosition(damagedPlayer);
		const py = y + 1;
		
		for(let dx=-2;dx<=2;dx++)for(let dz=-2;dz<=2;dz++)api.playParticleEffect({dir1:[-1,-1,-1],dir2:[1,1,1],pos1:[x+dx,py,z+dz],pos2:[x+dx+1,py+1,z+dz+1],texture:"square_particle",minLifeTime:.2,maxLifeTime:.6,minEmitPower:2,maxEmitPower:2,minSize:.25,maxSize:.35,manualEmitCount:20,gravity:[0,-10,0],colorGradients:[{timeFraction:0,minColor:[0,200,0,1],maxColor:[255,255,0,1]},],velocityGradients:[{timeFraction:0,factor:1,factor2:1},],blendMode:1});
	}
	
	//This is my code
	var currentSlot = api.getSelectedInventorySlotI(attackingPlayer) //note that we can't use withItem for this reason (need to get the slot to be able update the item's data)
	if (api.getHeldItem(attackingPlayer) != null) {
		var customDisplayName = api.getHeldItem(attackingPlayer).attributes.customDisplayName
		var customAttributes = api.getHeldItem(attackingPlayer).attributes.customAttributes
		var effects = customAttributes.customEffects
		if (effects != null) {
			var counter = 0
			while (counter < effects.length) {
				if (Date.now() - effects[counter].lastUsedEffect > effects[counter].effectCooldown) {
					effects[counter].lastUsedEffect = Date.now()
					var itemHeld = api.getHeldItem(attackingPlayer)
					var amount = itemHeld.amount
					if (amount == 0) {
						amount = 1
					}
					if (effects[counter].effectName == "Heal") { //Custom Instant Heal effect
						api.setHealth(damagedPlayer, api.getHealth(damagedPlayer) + effects[counter].value)
					} else if (effects[counter].effectName == "Swap") { //Custom Swap Places effect
						var actualPlace = api.getPosition(attackingPlayer)
						api.setPosition(attackingPlayer, api.getPosition(damagedPlayer))
						api.setPosition(damagedPlayer, actualPlace)
					/*} else if (effects[counter].effectName == "Knockback") { //Custom Knockback effect - Not working due to a bug with applyImpulse and setVelocity when use in a tick where the player is taking damage
						api.applyImpulse(damagedPlayer, 0, effects[counter].effectDuration * 3, 0)
					*/} else if (effects[counter].effectName == "Lifesteal") { //Custom Lifesteal effect
						api.setClientOption(attackingPlayer, "maxHealth", api.getClientOption(attackingPlayer, "maxHealth") + effects[counter].value)
						api.setClientOption(damagedPlayer, "maxHealth", api.getClientOption(damagedPlayer, "maxHealth") - effects[counter].value)
					} else {
						api.applyEffect(damagedPlayer, effects[counter].effectName, effects[counter].effectDuration, {icon:itemHeld.name, displayName:effects[counter].effectName, inBuiltLevel : effects[counter].value})
					}
				} else {
					api.sendMessage(attackingPlayer, "This effect is still on cooldown for " + (effects[counter].effectCooldown - (Date.now() - effects[counter].lastUsedEffect)) / 1000 + "s", {color:"red"})
				}
				counter++
			}
		}
		api.setItemSlot(attackingPlayer, currentSlot, api.getHeldItem(attackingPlayer).name, amount, {customAttributes:customAttributes, customDisplayName:customDisplayName})
	}
}

function playerCommand(playerId, command) {
	if (command.includes("craft")) {
		var commandName = ""
		var counter = 0
		while (command[counter] != " " && counter < command.length) {
			commandName += command[counter]
			counter++
		}
		if (commandName != "craft" && commandName != "help") {
			return false
		} else if (commandName == "help") {
			api.sendMessage(playerId, "You can craft the following items :", {color : "aqua"})
			var keys = Object.keys(craftingRecipes)
			for (const key in keys) {
				if (!craftingRecipes[keys[+key]].crafted) {
					api.sendMessage(playerId, "- " + keys[+key], {color : "aqua"})
				}
			}
			api.sendMessage(playerId, "using /craft <item> command. To know the item's recipe, use /recipe <item>. Please note that a message will be displayed to all players, when using /craft <item>, indicating that you crafted this item", {color : "aqua"})
			return true
		}
		var itemToCraft = ""
		counter++
		while (counter < command.length) {
			itemToCraft+= command[counter]
			counter++
		}
		if (!craft(playerId, itemToCraft)) {
			api.sendMessage(playerId, "An unexpected error has occured", {color:"red"})
		}
		return true
	} else if (command.includes("recipe")) {
		var commandName = ""
		var counter = 0
		while (command[counter] != " " && counter < command.length) {
			commandName += command[counter]
			counter++
		}
		if (commandName != "recipe") {
			return false
		}
		var itemToRecipe = ""
		counter++
		while (counter < command.length) {
			itemToRecipe += command[counter]
			counter++
		}
		api.sendMessage(playerId, "Ingredients needed to craft " + itemToRecipe + " :", {color:"aqua"})
		var keys = Object.keys(craftingRecipes[itemToRecipe].items)
		for (const key in keys) {
			api.sendMessage(playerId, craftingRecipes[itemToRecipe]["items"][keys[+key]] + " " + keys[+key], {color:"aqua"})
		}
		return true
	} else if (command.includes("help")) {
		var commandName = ""
		var counter = 0
		while (command[counter] != " " && counter < command.length) {
			commandName += command[counter]
			counter++
		}
		if (commandName != "help") {
			return false
		}
		api.sendMessage(playerId, "Use /help craft for a detailed help", {color : "aqua"})
		return true
	}
}


function hasItemsNeeded(playerId, recipe) {
	var keys = Object.keys(craftingRecipes[recipe].items)
	for (const key in keys) {
		if (api.getInventoryItemAmount(playerId, keys[+key]) < craftingRecipes[recipe]["items"][keys[+key]]) {
			return false
		}
	}
	return true
}

function craft(playerId, recipe) {
	if (craftingRecipes[recipe] == null) {
		api.sendMessage(playerId, "This item does not exist or is uncraftable", {color:"red"})
		return true
	}
	if (!hasItemsNeeded(playerId, recipe)) {
		api.sendMessage(playerId, "You don't have all the items needed", {color:"red"})
		return true
	}
	if (api.inventoryIsFull(playerId)) {
		api.sendMessage(playerId, "Your inventory is full", {color:"red"})
		return true
	}
	if (craftingRecipes[recipe].crafted) {
		api.sendMessage(playerId, "This item is already crafted", {color:"red"})
		return true
	}
	var keys = Object.keys(craftingRecipes[recipe].items)
	for (const key in keys) {
		api.removeItemName(playerId, keys[+key], craftingRecipes[recipe]["items"][keys[+key]])
	}
	api.giveItem(playerId, craftingRecipes[recipe].item, 1, craftingRecipes[recipe].attributes)
	if (craftingRecipes[recipe].isUniqueItem) {
		api.broadcastMessage(api.getEntityName(playerId) + " has crafted " + recipe, {color:"turquoise"})
		craftingRecipes[recipe].crafted = true
	}
	return true
}
