
// Video configuration - will be expanded when real videos are added

export interface VideoConfig {
    id: string
    title: string
    description: string
    duration: string        // e.g., "3:24"
    thumbnailUrl?: string   // Optional: custom thumbnail
    videoUrl?: string       // Optional: actual video URL (YouTube, Vimeo, etc.)
    isPlaceholder: boolean
}

export const videos: Record<string, VideoConfig> = {
    cmmc_overview_v1: {
        id: 'cmmc_overview_v1',
        title: 'CMMC Level 2 Readiness Assessment Overview',
        description: 'What to expect · How scoring works · Next steps',
        duration: '3:24',
        thumbnailUrl: undefined,
        videoUrl: undefined,
        isPlaceholder: true  // Set to false when real video is added
    }
}

export function getVideo(id: string): VideoConfig | undefined {
    return videos[id]
}
