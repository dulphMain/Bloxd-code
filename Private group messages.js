function playerCommand(playerId, command) { //Syntax : /groupmsg ["player1Name", "player2Name", "player3Name"] <message>
    var commandList = ["groupmsg"]
    command = command.split(" ")
    if (commandList.includes(command[0])) {
		var message = ""
		var counter = 1
		var strPlayerList = ""
		while (!(command[counter].includes("]"))) {
			strPlayerList += command[counter]
			counter++
		}
		strPlayerList += command[counter]
		playerList = eval(strPlayerList)
		counter++
		while (counter < command.length - 1) {
			message += command[counter] + " "
			counter++
		}
		message += command[counter]
		for (var player in playerList) {
			if (api.getPlayerId(playerList[player]) != null) {
				api.sendMessage(api.getPlayerId(playerList[player]), strPlayerList + " " + api.getEntityName(playerId) + ": " + message, {color:"blue"})
			} else {
				api.sendMessage(playerId, "Player " + playerList[player] + " doesn't exist or is not online", {color : "red"})
			}
		}
		api.sendMessage(playerId, strPlayerList + " " + api.getEntityName(playerId) + ": " + message, {color:"blue"})
		return true
    }
}
