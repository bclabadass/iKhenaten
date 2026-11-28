// Warships stuck by the shipwright (Brendan, Meidum 6: "the warships appear to be stuck next to the transport wharf
// bordering the shipwright"). The shipwright launched a new boat on the first nearby water tile with two water
// neighbours; boat routing only starts from water with water on all eight sides, so a warship put on the strip
// between the shipwright and the transport wharf (84,54) never found a route and sat there for good. The shipwright
// now prefers a tile boats can route from, and a warship that cannot reach its destination from such a tile moves to
// the nearest water it can sail from (frees the two already stuck in the save).
// Needs the Duo save in the Pharaoh folder's Save/DuoSaves/; without it the test logs a skip and passes.
// Markers:
//   [test-marker] t936_launch_tile_routable
//   [test-marker] t936_stuck_warships_sail
//   [test-marker] t936_save_skipped

function t936_unpack(v) {
    return { x: Math.floor(v / 1000), y: v % 1000 }
}

function run_test() {
    if (!__game_load_savegame(__test_data_dir() + '/Save/DuoSaves/Meidum 6.svx')) {
        __log_marker('t936_save_skipped')
        __test_signal_ready()
        return
    }
    __test_pump_frames(2)

    var shipwright = 0
    for (var b = 1; b < 4000 && !shipwright; b++) {
        if (__building_type(b) == BUILDING_SHIPWRIGHT) {
            shipwright = b
        }
    }
    var ships = []
    for (var f = 1; f < 3000; f++) {
        var fig = city.get_figure(f)
        if (fig && fig.valid && fig.type == FIGURE_WARSHIP) {
            ships.push(f)
        }
    }
    if (!shipwright || ships.length < 2) {
        __log_info_native('[test:936] expected a shipwright and two warships, got ' + shipwright + ' / ' + ships.length)
        __test_signal_ready()
        return
    }

    // A warship is launched one ring further out than other boats (size + 1).
    var st = __building_tile(shipwright)
    var launch = t936_unpack(__test_water_spawn_boat_tile(st.x, st.y, city.get_building(shipwright).size + 1))
    var far = t936_unpack(__test_figure_destination_tile(ships[1]))
    var reach = __test_boat_water_distance(launch.x, launch.y, far.x, far.y)
    __log_info_native('[test:936] shipwright ' + shipwright + ' launches warships at ' + launch.x + ',' + launch.y
        + '; boat distance to ' + far.x + ',' + far.y + ': ' + reach)
    if (reach > 0) {
        __log_marker('t936_launch_tile_routable')
    }

    var start = ships.map(function(id) { return { x: __test_figure_tile_x(id), y: __test_figure_tile_y(id) } })
    var dest = ships.map(function(id) { return t936_unpack(__test_figure_destination_tile(id)) })
    __test_run_ticks(900)
    var arrived = 0
    for (var i = 0; i < ships.length; i++) {
        var x = __test_figure_tile_x(ships[i])
        var y = __test_figure_tile_y(ships[i])
        __log_info_native('[test:936] warship ' + ships[i] + ' from ' + start[i].x + ',' + start[i].y + ' to ' + dest[i].x + ',' + dest[i].y
            + ': now at ' + x + ',' + y)
        if (Math.max(Math.abs(x - dest[i].x), Math.abs(y - dest[i].y)) <= 1) {
            arrived++
        }
    }
    if (arrived == ships.length) {
        __log_marker('t936_stuck_warships_sail')
    }
    __test_signal_ready()
}

function check_valid() {
    return __test_find_inlog('[test-marker] t936_save_skipped')
        || (__test_find_inlog('[test-marker] t936_launch_tile_routable') && __test_find_inlog('[test-marker] t936_stuck_warships_sail'))
}
