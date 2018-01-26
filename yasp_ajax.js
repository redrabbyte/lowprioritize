function getLatestMatchID(player_id) {
  var match_id = undefined;
  
  $.ajax({url: 'https://api.opendota.com/api/players/' + player_id + '/matches', dataType: 'json', data: {significant: 0, limit: 1}, async: false, success: function (data) {
    match_id = data[0].match_id;
  }});
  
  return match_id;
}

function getPlayers(match_id) {
  var players = [];
  $.ajax({url: 'https://api.opendota.com/api/matches/' + match_id, dataType: 'json', async: false, success: function (data) {
    players = data.players;
  }});
  return players;
}

function getPlayerMatches(player_id, count) {
  
  matches = [];
  
  if (player_id == null)
    return matches;
  
  $.ajax({url: 'https://api.opendota.com/api/players/' + player_id + '/matches', dataType: 'json', data: {significant: 0, limit: count}, async: false, success: function (data) {
    matches = data;
  }});
  
  return matches;
}
