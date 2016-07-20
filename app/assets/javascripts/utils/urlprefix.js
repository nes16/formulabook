define(['require'],function(require){
  var URL_PREFIX = window.location.href.split('/testlab')[0] + '/testlab';
  // if we're on the file:// protocol we don't want to look at pathname. It'll
  // be a really ugly path listing all the directories we need to go through to
  // get to the index.html file. Just pretend like we're on a live server.
  if (window.location.protocol === 'file:') URL_PREFIX = '/testlab';
  return URL_PREFIX;
});
