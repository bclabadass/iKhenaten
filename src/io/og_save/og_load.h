#pragma once

#include "io/og_save/og_save.h"

// Stage 2 of the original-save converter: OG records (og::savegame) written straight into the runtime objects.
// This path is separate from the .svx binds on purpose, so the bind layout can change without touching it.
// The scenario (rules, events, empire layout) comes from our mission script; only city state is taken from the
// save. OG data without a home in our model is logged as "[og-save] unmapped ..." and left out.
namespace og {

    struct load_report {
        int buildings = 0;
        int buildings_dropped = 0;
        int buildings_runtime_unmapped = 0;
        int figures_dropped = 0;
        int legions = 0;
        int pyramids = 0;
        int formations_dropped = 0;
        int events_synced = 0;
        int events_unmatched = 0;
    };

    // The campaign mission the save was played in, -1 for a custom scenario.
    int mission_id(const savegame& s);

    void load_grids(const savegame& s);
    void load_world(const savegame& s);
    void load_city_state(const savegame& s);
    // drop_unmodelled: leave out records of types we have no building model for (the OG generic pyramid, ...) and
    // gatehouses, which the map's gatehouse terrain gives (a mission start).
    void load_buildings(const savegame& s, load_report& report, bool drop_unmodelled = false);
    void load_formations(const savegame& s, load_report& report);
    void load_events(const savegame& s, load_report& report);

    // State that depends on what post_load rebuilt (food slots follow the city's allowed foods).
    void load_after_post_load(const savegame& s);

    void load_storages(const savegame& s);

    // The original's generic pyramid (type 183, 2x2 parts) as the mission's allowed pyramid of the same footprint.
    // Only a finished one is converted (every part at its target layer); a partly built one stays left out.
    void load_pyramids(const savegame& s, load_report& report);

    // Population census and the workers it gives; houses carry their people, the census is what counts them.
    void load_census(const savegame& s);

    // The buildings a campaign mission starts with (Thinis' temple complex and mansion, Byblos' town, Kebet's walled
    // town, ...), from the mission's mission1.pak entry on top of its shipped map, which carries only the grids. Their
    // tiles keep the map's pictures, renumbered for a Pharaoh 1.0 entry (V147_PICTURE_SHIFT).
    void load_mission_start(const savegame& s, load_report& report);
    // The rest of a mission start, once post_load has applied the mission script: house and bazaar foods, the census,
    // and the original's generic pyramid as the mission's own (Khmun's and Menat Khufu's are finished, awaiting goods).
    void load_mission_after_post_load(const savegame& s, load_report& report);

    enum {
        // Pharaoh 1.0's entries (v147: Serabit Khadim, Kebet, Menat Khufu) number every building picture 539 above
        // ours, from the houses on; later entries number them as we do.
        V147_LAST_VERSION = 147,
        V147_PICTURE_SHIFT = 539,
    };

} // namespace og
