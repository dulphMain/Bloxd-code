The item declaration at the start of world code should have this format :

`{"itemId" : {items : {"1st item needed in craft" : "this item's quantity", "2nd item needed in craft" : "this item's quantity"}, crafted : "is this item already crafted ?", isUniqueItem : "is this item only craftable once ?", attributes : {customDisplayName : "Item's name", customAttributes : {customEffects : [{effectName : "1st effect ID", effectDuration : "1st effect's duration", effectCooldown : "1st effect's cooldown", lastUsedEffect : "when was the 1st effect last used", value : "1st effect's custom value"}, {effectName : "2nd effect ID", effectDuration : "2nd effect's duration", effectCooldown : "2nd effect's cooldown", lastUsedEffect : "when was the 2nd effect last used", value : "2nd effect's custom value"}]}}, item : "What item is it really in-game"}}`

- itemId can be any string, but should be the same as attributes.customDisplayName
	- items represent each item needed for the craft, with each item having format itemId : itemCount where itemId (string) must be an in-game valid item name and itemCount (integer) should be between 1 and 999 (note that the ingredients of the recipes must be able to be held in inventory)
	- crafted (boolean) only serves if isUniqueItem is set to true, it should always be false unless you don't want to make this item craftable
	- isUniqueItem (boolean) serves to tell if the item can be crafted multiple times or not
	- attributes is the item's attributes used in giveItem
		- customDisplayName will be the item's in-game name, should be the same as itemId
		- customAttributes only holds customEffects
			- customEffects holds the effects applied by this item on hit as {effectName : "effect id", effectDuration : "effect duration", effectCooldown : "effect cooldown", lastUsedEffect : "last used effect", value : "custom value"}
				- effectName (string) must be a valid effect Id or "Heal", "Knockback" (not working), "Lifesteal" or "Swap", which will be applied on the hit player
				- effectDuration (integer) decides the duration, in ms, for which effectName is applied on the hit player, is not used when effectName is a custom effect
				- effectCooldown (integer) decides the time, in ms, before the effect can be re-applied on hit
				- lastUsedEffect (integer) should be 0 and only serves for the cooldown
				- value (any) is a custom value, which's use will depend of the effect, will mostly be used for effect level, as an integer, apart on custom effects (see "Notes on custom effects")
	- item (string) must be a valid item name, which will decide which item is given

Notes on custom effects :
- "Heal" replaces instant heal, value (integer) here serves for the health points to be added (can be negative, will then damage the target, note that the target's health will never come above its previous maxHealth)
- "Knockback" is currently not working due to a Bloxd bug with applyImpulse and setVelocity when the target is taking damage, value (Array<float>) will here represent a list of motions in each direction
- "Lifesteal" here takes max health from the target to add it to the weapon wielder's max health, value (integer) will here be the amount of maxHealth transfered from one player to another
- "Swap" will swap the weapon wielder and the target's places, value (any) here serves no purpose

Example :
`{"Excalibur" : {items : {"Block of Gold" : 10, "Instant Damage Potion II" : 3, "Knight Heart" : 1}, crafted : false, isUniqueItem : true, attributes : {customDisplayName: "Excalibur", customAttributes: {customEffects: [{effectName: "Lifesteal", effectDuration: 0, effectCooldown : 30000, lastUsedEffect : 0, value : 5}, {effectName: "Poisoned", effectDuration: 5000, effectCooldown : 20000, lastUsedEffect : 0, value : 1}]}}, item : "Gold Sword"}}`

We have here a weapon named Excalibur (the Id and `id.attributes.customDisplayName` are both "Excalibur"). This item can be crafted using 10 Blocks of Gold, 3 Instant Damage Potion II and 1 Knight Heart (`id.items`). This weapon can be crafted (`id.crafted` is false) but can only be crafted one time (`id.isUniqueItem` is true). On player hit, this item will apply the following effects : 1st, it will steal (`id.attributes.customAttributes.customEffects[0].effectName` is "Lifesteal") 5hp (`id.attributes.customAttributes.customEffects[0].value` is 5) from the target's maxHealth and add them to the wielder's max health, with a 30s-cooldown (`id.attributes.customAttributes.customEffects[0].effectCooldown` is 30000ms, being 30s). 2nd, it will apply the "Poisoned" effect (`id.attributes.customAttributes.customEffects[1].effectName` is "Poisoned"), level 1 (id.attributes.customAttributes.customEffects[1].value is 1), to the target for 5s (`id.attributes.customAttributes.customEffects[1].effectDuration` is 5000ms, being 5s), with a 20s-cooldown (`id.attributes.customAttributes.customEffects[1].effectCooldown` is 20000ms, being 20s).

Recap : We have a unique sword, Excalibur, craftable with 10 Blocks of Gold, 3 Instant Damage Potion II and 1 Knight Heart, that on hit does the following :
- steal 5hp from the target's maxHealth and add them to the wielder's max health, with a 30s cooldown
- apply the "Poisoned" effect level 1 for 5s to the target, with a 20s cooldown
- do 54 damage (the gold sword's base damage)


Note that this adds 2 new commands :
- /recipe <item Id> which shows <item ID>'s recipe
- /craft <item Id> which crafts <item ID> if the requirements are met (all ingredients, not already crafted if unique, not full inventory) and displays a message to all players : "<player> has crafted <item ID>" if the item is unique
