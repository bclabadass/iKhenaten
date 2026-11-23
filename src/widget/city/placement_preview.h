#pragma once

struct painter;

namespace placement_preview {
    void draw(painter& ctx);

    // What the last building preview drew: its draw commands, how many were made see-through, and
    // how many were already translucent and kept as they were.
    struct ghost_fade_stats {
        int drawn = 0;
        int faded = 0;
        int kept = 0;
    };
    const ghost_fade_stats& last_ghost_fade_stats();
}
