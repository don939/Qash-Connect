cordova.define("cordova-plugin-camera.CameraProxy", function(require, exports, module) { /*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

const HIGHEST_POSSIBLE_Z_INDEX = 2147483647;

function takePicture (success, error, opts) {
    if (opts && opts[2] === 1) {
        capture(success, error, opts);
    } else {
        const input = document.createElement('input');
        input.style.position = 'relative';
        input.style.zIndex = HIGHEST_POSSIBLE_Z_INDEX;
        input.className = 'cordova-camera-select';
        input.type = 'file';
        input.name = 'files[]';

        input.onchange = function (inputEvent) {
            const reader = new FileReader(); /* eslint no-undef : 0 */
            reader.onload = function (readerEvent) {
                input.parentNode.removeChild(input);

                const imageData = readerEvent.target.result;

                return success(imageData);
            };

            reader.readAsDataURL(inputEvent.target.files[0]);
        };

        document.body.appendChild(input);
    }
}

function capture (success, errorCallback, opts) {
    let localMediaStream;
    let targetWidth = opts[3];
    let targetHeight = opts[4];

    targetWidth = targetWidth === -1 ? 320 : targetWidth;
    targetHeight = targetHeight === -1 ? 240 : targetHeight;

    const video = document.createElement('video');
    const button = document.createElement('button');
    const parent = document.createElement('div');
    parent.style.position = 'relative';
    parent.style.zIndex = HIGHEST_POSSIBLE_Z_INDEX;
    parent.className = 'cordova-camera-capture';
    parent.appendChild(video);
    parent.appendChild(button);

    video.width = targetWidth;
    video.height = targetHeight;
    button.innerHTML = 'Capture!';

    button.onclick = function () {
        // create a canvas and capture a frame from video stream
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        canvas.getContext('2d').drawImage(video, 0, 0, targetWidth, targetHeight);

        // convert image stored in canvas to base64 encoded image
        const imageData = canvas.toDataURL('image/png');

        // stop video stream, remove video and button.
        // Note that MediaStream.stop() is deprecated as of Chrome 47.
        if (localMediaStream.stop) {
            localMediaStream.stop();
        } else {
            localMediaStream.getTracks().forEach(function (track) {
                track.stop();
            });
        }
        parent.parentNode.removeChild(parent);

        return success(imageData);
    };

    navigator.getUserMedia = navigator.getUserMedia ||
                             navigator.webkitGetUserMedia ||
                             navigator.mozGetUserMedia ||
                             navigator.msGetUserMedia;

    const successCallback = function (stream) {
        localMediaStream = stream;
        if ('srcObject' in video) {
            video.srcObject = localMediaStream;
        } else {
            video.src = window.URL.createObjectURL(localMediaStream);
        }
        video.play();
        document.body.appendChild(parent);
    };

    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            .then(successCallback)
            .catch(errorCallback);
    } else if (navigator.getUserMedia) {
        navigator.getUserMedia({ video: true, audio: false }, successCallback, errorCallback);
    } else {
        alert('Browser does not support camera :(');
    }
}

module.exports = {
    takePicture,
    cleanup: function () {}
};

require('cordova/exec/proxy').add('Camera', module.exports);

});
