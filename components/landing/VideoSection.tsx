'use client'

import { useState } from 'react'
import posthog from 'posthog-js'
import { videos } from '@/lib/videoConfig'

export default function VideoSection() {
    const [clicked, setClicked] = useState(false)
    const video = videos['cmmc_overview_v1']

    const handleVideoClick = () => {
        posthog.capture('video_clicked', {
            video_id: video.id,
            source: 'landing_page',
            placement: 'below_hero'
        })
        setClicked(true)
    }

    // FUTURE VIDEO EVENTS (implement when real video is added):
    // 
    // posthog.capture('video_started', { 
    //   video_id, source, placement 
    // })
    //
    // posthog.capture('video_progress', { 
    //   video_id, percent_watched: 25 | 50 | 75, watch_time_seconds 
    // })
    //
    // posthog.capture('video_completed', { 
    //   video_id, watch_duration_seconds 
    // })
    //
    // posthog.capture('video_abandoned', { 
    //   video_id, percent_watched, abandon_point_seconds 
    // })

    return (
        <section className="py-16 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900">
                        See How It Works
                    </h2>
                    <p className="mt-2 text-gray-600">
                        A 3-minute overview of the CMMC Level 2 readiness assessment process
                    </p>
                </div>

                {/* Video Placeholder */}
                <div
                    onClick={handleVideoClick}
                    className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden cursor-pointer group shadow-xl"
                >
                    {/* Placeholder Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">

                        {!clicked ? (
                            <>
                                {/* Play Button */}
                                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors backdrop-blur-sm">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg relative z-10">
                                        <svg
                                            className="w-8 h-8 text-gray-900 ml-1"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Duration Badge */}
                                <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-2 py-1 rounded font-medium">
                                    {video.duration}
                                </div>
                            </>
                        ) : (
                            /* Coming Soon State */
                            <div className="text-center text-white px-4 animate-fadeIn">
                                <p className="text-xl font-medium mb-2">Video Coming Soon</p>
                                <p className="text-sm text-gray-400 max-w-sm mx-auto">
                                    We're preparing a detailed walkthrough of the assessment methodology. Check back soon!
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Thumbnail Overlay Text */}
                    {!clicked && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 pt-16">
                            <p className="text-white font-medium text-lg leading-snug">
                                {video.title}
                            </p>
                            <p className="text-gray-300 text-sm mt-1">
                                {video.description}
                            </p>
                        </div>
                    )}
                </div>

                {/* Supporting Text */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    No signup required to watch
                </p>
            </div>
        </section>
    )
}
