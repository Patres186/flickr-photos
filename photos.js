/*global jQuery*/

var setupPhotos = (function ($) {
	function getCookie(c_name) {
		var c_value = document.cookie;
		var c_start = c_value.indexOf(" " + c_name + "=");
		
		if (c_start == -1) {
			c_start = c_value.indexOf(c_name + "=");
		}
		
		if (c_start == -1) {
			c_value = null;
		} else {
			c_start = c_value.indexOf("=", c_start) + 1;
			var c_end = c_value.indexOf(";", c_start);
			
			if (c_end == -1) {
				c_end = c_value.length;
			}
			c_value = unescape(c_value.substring(c_start,c_end));
		}
		return c_value;
	}
	
    function each (items, callback) {
        var i;
        for (i = 0; i < items.length; i += 1) {
            setTimeout(callback.bind(this, items[i]), 0);
        }
    }

    function flatten (items) {
        return items.reduce(function (a, b) {
            return a.concat(b);
        });
    }

    function loadPhotosByTag (tag, max, callback) {
        var photos = [];
        var callback_name = 'callback_' + Math.floor(Math.random() * 100000);

        window[callback_name] = function (data) {
            delete window[callback_name];
            var i;
            for (i = 0; i < max; i += 1) {
                photos.push(data.items[i].media.m);
            }
            callback(null, photos);
        };

        $.ajax({
            url: 'http://api.flickr.com/services/feeds/photos_public.gne',
            data: {
                tags: tag,
                lang: 'en-us',
                format: 'json',
                jsoncallback: callback_name
            },
            dataType: 'jsonp'
        });
    }

    function loadAllPhotos (tags, max, callback) {
        var results = [];
        function handleResult (err, photos) {
            if (err) { return callback(err); }

            results.push(photos);
            if (results.length === tags.length) {
                callback(null, flatten(results));
            }
        }

        each(tags, function (tag) {
            loadPhotosByTag(tag, max, handleResult);
        });
    }

    function renderPhoto (photo) {
        var img = new Image();
        img.src = photo;
        return img;
    }
    
    var favArr = (getCookie('fav')) ? getCookie('fav').split("|") : [];
    function handleClick(e) {
    	var elm = e.target;
    	var imgSrc = elm.parentNode.getElementsByTagName('img')[0].src;
    	
    	if (elm.className === 'icon-heart-empty') {
            elm.className = 'icon-heart';
            favArr.push(imgSrc);
    	} else {
        	var index = favArr.indexOf(imgSrc);
        	elm.className = 'icon-heart-empty';
        	favArr.splice(index, 1);
    	}
    	document.cookie = 'fav=' + favArr.join('|');
    }

    function imageAppender (id) {
        var holder = document.getElementById(id);

        return function (img) {
            var elm = document.createElement('div');
            elm.className = 'photo';
            var likeElm = document.createElement('i');
            likeElm.className = (favArr.indexOf(img.src) >= 0) ? 'icon-heart' : 'icon-heart-empty';
            likeElm.addEventListener("click", handleClick, false);
            elm.appendChild(likeElm);
            elm.appendChild(img);
            holder.appendChild(elm);
        };
    }

    // ----
    
    var max_per_tag = 5;
    return function setup (tags, callback) {
        loadAllPhotos(tags, max_per_tag, function (err, items) {
            if (err) { return callback(err); }

            each(items.map(renderPhoto), imageAppender('photos'));
            callback();
        });
    };
}(jQuery));
