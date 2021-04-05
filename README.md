# browser-analytics-capture-js
A tiny (4.6kb gzipped &amp; minified) JS library to capture analytics in the browser and send them to a server. An example of using Cloudflare Workers for processing this data and adding it to BigQuery has also been open-sourced [here](https://github.com/Full-Stack-Data/cloud-workers-bigquery-ingest).

## Usage
### For logging pageviews and engagement metrics
```
<script src="/path/to/ingest.js"></script>
<script>document.addEventListener("DOMContentLoaded", fsdIngest('YOUR_CLIENT_ID'));</script>
```

### For logging events
After you've called fsdIngest,
```
<script>document.addEventListener("DOMContentLoaded", fsdIngest('EVENT_NAME', 'EVENT_VALUE'));</script>
```


## What analytics does it capture?
### Engagement Metrics
- Active time spent by the user on a page
- Maximum scroll depth by the user on the page

### Unique identification and device metrics
- User UUID (randomly generated)
- Session ID (randomly generated)
- URL Path
- Screen Resolution
- Whether or not the user is on mobile

### Long-term usage metrics
- Lifetime number of pageviews
- Lifetime number of session
- Number of hits per session
- Whether the user has been active on the site recently

### Referrer details

### Any other metrics you want to capture

## Comptability
Works with all browsers that support [ES6](https://caniuse.com/?search=es6)
