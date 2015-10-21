(function() {
  var firstRun = !window.polis;
  window.polis = window.polis || {};
  var iframes = [];
  var polisUrl = "https://embed.pol.is";

  function getConfig(d) {
     return {
         conversation_id: d.getAttribute("data-conversation_id"),
         site_id: d.getAttribute("data-site_id"),
         page_id: d.getAttribute("data-page_id"),
         parent_url: d.getAttribute("data-parent_url"),
         border: d.getAttribute("data-border"),
         border_radius: d.getAttribute("data-border_radius"),
         height: d.getAttribute("data-height"),
         demo: d.getAttribute("data-demo"),

         // These config variables will be used to init the conversation.
         // Subsequent loads will not update to these values in our DB.
         // To change the values, go to the config tab of
         // https://pol.is/m/<conversation_id>
         auth_needed_to_vote: d.getAttribute("data-auth_needed_to_vote"), // default false
         auth_needed_to_write: d.getAttribute("data-auth_needed_to_write"), // default true
         // Prompt users to auth using Facebook.
         auth_opt_fb: d.getAttribute("data-auth_opt_fb"), // default true
         // Prompt users to auth using Twitter.
         auth_opt_tw: d.getAttribute("data-auth_opt_tw"), // default true
         // This is here in case we add other auth providers (Google, etc), you can preemptively disable them by setting this to false.
         // Example: if auth_opt_fb is true, but auth_opt_allow_3rdparty is false, users will not be prompted to auth using Facebook.
         auth_opt_allow_3rdparty: d.getAttribute("data-auth_opt_allow_3rdparty"); // default true


         ptpts_can_vote: d.getAttribute("data-ptpts_can_vote"),
         ptpts_can_write: d.getAttribute("data-ptpts_can_write"),
         ptpts_can_see_vis: d.getAttribute("dataptpts_can_see_vis-")

     };
  }

  var polisEventCallbacks = {
   vote: [],
   doneVoting: [],
   write: [],
  };

  polis.on = function(eventName, handler) {
    if(polisEventCallbacks[eventName]){
      polisEventCallbacks[eventName].push(handler);
    }
  }

  function createPolisIframe(parent, o) {
    var iframe = document.createElement("iframe");
    var path = [];
    if (o.demo) {
      path.push("demo");
    }
    o.parent_url = o.parent_url || window.location+"";
    var id = "polis_";
    if (o.conversation_id) {
      path.push(o.conversation_id);
      id += o.conversation_id;
    } else if (o.site_id) {
      path.push(o.site_id);
      id += o.site_id;
      if (!o.page_id) {
        alert("Error: need data-page_id when using data-site_id");
        return;
      }
      path.push(o.page_id);
      id += "_" + o.page_id;
    } else {
      alert("Error: need data-conversation_id or data-site_id");
      return;
    }
    var src = polisUrl+ "/" + path.join("/");
    var paramStrings = [];
    if (o.parent_url) {
      paramStrings.push("parent_url="+ encodeURIComponent(o.parent_url));
    }
    if (o.parent_url) {
      paramStrings.push("referrer="+ encodeURIComponent(document.referrer));
    }
    if (paramStrings.length) {
      src += "?" + paramStrings.join("&");
    }

    iframe.src = src;
    iframe.width = "100%"; // may be constrained by parent div
    iframe.height = o.height || 930;
    iframe.style.border = o.border || "1px solid #ccc";
    iframe.style.borderRadius = o.border_radius || "4px";
    iframe.style.padding = o.padding || "4px"; // 1px ensures that right border shows up on default wordpress theme
    iframe.style.backgroundColor = "rgb(247, 247, 247)";
    iframe.id = id;
    parent.appendChild(iframe);
    iframes.push(iframe);
  }

  function cookiesEnabledAtTopLevel() {
    // create a temporary cookie
    var soon = new Date(Date.now() + 1000).toUTCString();
    var teststring = "_polistest_cookiesenabled";
    document.cookie = teststring + "=1; expires=" + soon;
    // see if it worked
    var cookieEnabled = document.cookie.indexOf(teststring) != -1;
    // clear the cookie
    document.cookie = teststring + "=; expires=" + (new Date(0)).toUTCString();
    return cookieEnabled;
  }

  function encodeReturnUrl(str) {
    var x, i;
    var result = "";
    for (i=0; i<str.length; i++) {
      x = str.charCodeAt(i).toString(16);
      result += ("000"+x).slice(-4);
    }
    return result;
  }


  if (firstRun) {
    // function notifyIframes(message) {
    //   // NOTE: twitterWindow closes itself
    //   for (var i = 0; i < iframes.length; i++) {
    //     var x = iframes[i];
    //     var c = x.contentWindow;
    //     if (c && c.postMessage) {
    //       c.postMessage(message, "*");
    //     }
    //   }
    // }

    window.addEventListener("message", function(event) {
      var data = event.data||{};
      // if (!event.origin.match(/pol.is$/)) {
      //   return;
      // }

      var cbList = polisEventCallbacks[data.name]||[];
      for (var i = 0; i < cbList.length; i++) {
        cbList[i]({
          iframe: document.getElementById("polis_" + data.polisFrameId),
          data: data
        });
      }

      if (data === "cookieRedirect" && cookiesEnabledAtTopLevel()) {
        // temporarily redirect to polis, which will set a cookie and redirect back
        window.location = polisUrl + "/api/v3/launchPrep?dest=" + encodeReturnUrl(window.location+"");
      }
      // if (data === "twitterConnectBegin") {
      //   // open a new window where the twitter auth screen will show.
      //   // that window will redirect back to a simple page that calls window.opener.twitterStatus("ok")
      //   var params = 'location=0,status=0,width=800,height=400';
      //   twitterWindow = window.open(polisUrl + "/api/v3/twitterBtn?dest=" + encodeReturnUrl(window.location+""), 'twitterWindow', params);
      // }

      if (data.name === "resize") {
        console.log(data.polisFrameId);
        var iframe = document.getElementById("polis_" + data.polisFrameId);
        // TODO uniquely identify each polis iframe so we can resize only the correct one
        // for (var i = 0; i < iframes.length; i++) {
          // var x = iframes[i];
          iframe.setAttribute("height", data.height);
        // }
      }


    }, false);
  }

  // Add iframes to any polis divs that don't already have iframes.
  // (check needed since this script may be included multiple times)
  var polisDivs = document.getElementsByClassName("polis");
  for (var i = 0; i < polisDivs.length; i++) {
      var d = polisDivs[i];
      if (d.children && d.children.length) {
          // already populated
      } else {
         var config = getConfig(d);
         createPolisIframe(d, config);
      }
  }
}());



