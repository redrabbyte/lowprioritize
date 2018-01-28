function getMatch(match_id) {
  if (match_id == undefined)
    return Promise.reject(new Error('undefined match'));
  return $.ajax({url: 'https://api.opendota.com/api/matches/' + match_id, dataType: 'json'});
}

function getLatestMatchID(player_id) {
  if (player_id == null)
    return Promise.reject(new Error('no matches found'));
  return $.ajax({url: 'https://api.opendota.com/api/players/' + player_id + '/matches', dataType: 'json', data: {significant: 0, limit: 1}});
}

function getPlayerMatches(player_id, count) {
  if (player_id == null)
    return Promise.resolve([]);
  
  return $.ajax({url: 'https://api.opendota.com/api/players/' + player_id + '/matches', dataType: 'json', data: {significant: 0, limit: count}});
}
