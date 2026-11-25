# Campaign mission maps

Shipped `FILE_FORMAT_MAP_FILE` maps for campaign scenarios (terrain, image,
elevation, moisture, fertility, vegetation, scenario_info, empire blobs, …).

Naming matches `src/scripts/mission/m_NNN_*.js` (scenarios **0–52**).

Each campaign mission sets `map_file : "data/maps/m_NNN_….map"`.
`GamestateIO::load_mission` loads that map; the maps carry no buildings. The
buildings a mission starts with (Thinis' temple complex and mansion, Byblos'
town, ...) come from the mission's entry in the original `mission1.pak` (a save
of the mission's first day), when the install has it (`og::load_mission_start`).
The entry's census and the houses' food come with them, and the original's finished
generic pyramid (Khmun, Menat Khufu) becomes the mission's own pyramid
(`og::load_mission_after_post_load`). Pharaoh 1.0's v147 entries (Serabit Khadim,
Kebet, Menat Khufu) number building pictures 539 above ours; the map's pictures under
their buildings are renumbered on load. Custom Cleopatra maps (ids 128+) use Cleop `Maps/` via
`__game_load_map`, not this folder.

Deployed at build time to `<binary>/Data/maps` (MSVC) or `<binary>/data/maps`.
