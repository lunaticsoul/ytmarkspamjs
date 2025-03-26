const fetch = require('node-fetch');

async function search(accessToken, config, result) {
    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('channelId', config.channel);
    url.searchParams.set('maxResults', result);
    url.searchParams.set('type', 'video');
    url.searchParams.set('order', 'date');
    const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!res.ok) {
        const error = await res.text();
        throw new Error(`YouTube API error: ${error}`);
    }
    
    const data = await res.json();
    return data;
}

async function commentThreads(accessToken, videoId) {
    const url = new URL('https://www.googleapis.com/youtube/v3/commentThreads');
    url.searchParams.set('part', 'snippet,replies');
    url.searchParams.set('maxResults', '100');
    url.searchParams.set('videoId', videoId);
    url.searchParams.set('order', 'time');
    const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!res.ok) {
        const error = await res.text();
        throw new Error(`YouTube API error: ${error}`);
    }
    
    const data = await res.json();
    return data;
}

async function setModerationStatus(accessToken, commentId, status) {
    let apiUrl = `https://www.googleapis.com/youtube/v3/comments/setModerationStatus?id=${commentId}&moderationStatus=${status}`;
    console.log(apiUrl);
    console.log(accessToken);
    const url = new URL(apiUrl);
    const res = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!res.ok) {
        const error = await res.text();
        throw new Error(`YouTube API error: ${error}`);
    }
}


module.exports = {
    search,
    commentThreads,
    setModerationStatus
};