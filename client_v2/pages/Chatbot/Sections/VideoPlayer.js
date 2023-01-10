import React, { useEffect, useRef } from "react";

export default function VideoPlayer(video_URL, videoEl) {

    return (
        <video
            style={{ maxWidth: "100%", width: "600px", margin: "0 auto" }}
            playsInline
            loop
            muted
            controls
            alt="All the devices"
            src={video_URL}
            ref={videoEl}
        />
    );
}
