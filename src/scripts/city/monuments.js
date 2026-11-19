log_info("akhenaten: city_monuments.js started")

// OG monument_defs (monument_object_data.c): the weight of each monument definition, by def id. A scenario
// names its monuments by def id in __scenario_monuments.first/second/third.
var MONUMENT_DEF_WEIGHTS = [
	0,
	4, 10,                 // 1-2 bent pyramid small, medium
	4, 12, 26, 48, 80,     // 3-7 mudbrick pyramid small, medium, large, complex, grand complex
	3, 9, 20, 36, 60,      // 8-12 stepped pyramid
	4, 12, 26, 48, 80,     // 13-17 true pyramid
	2, 3, 11,              // 18-20 mastaba small, medium, large
	10,                    // 21 Sphinx
	1, 3,                  // 22-23 obelisk small, large
	4,                     // 24 Sun Temple
	5, 5, 5,               // 25-27 Mausoleum by scenario size
	8, 12, 10,             // 28-30 Pharos lighthouse, Alexandria library, Caesareum
	5, 5,                  // 31-32 Colossi, Temple of Luxor
	4, 12, 26, 48,         // 33-36 royal tomb small, medium, large, grand
	48,                    // 37 Abu Simbel
]

// OG monument_get_def_id: the def ids a building type can register as. Read by C++ too (monuments.cpp: a mission
// allows each monument as many times as its briefing's three slots name it).
monument_def_ids {
  types [
    { type: BUILDING_SMALL_BENT_PYRAMID, defs: [1] }
    { type: BUILDING_MEDIUM_BENT_PYRAMID, defs: [2] }
    { type: BUILDING_SMALL_MUDBRICK_PYRAMID, defs: [3] }
    { type: BUILDING_MEDIUM_MUDBRICK_PYRAMID, defs: [4] }
    { type: BUILDING_LARGE_MUDBRICK_PYRAMID, defs: [5] }
    { type: BUILDING_MUDBRICK_PYRAMID_COMPLEX, defs: [6] }
    { type: BUILDING_GRAND_MUDBRICK_PYRAMID_COMPLEX, defs: [7] }
    { type: BUILDING_SMALL_STEPPED_PYRAMID, defs: [8] }
    { type: BUILDING_MEDIUM_STEPPED_PYRAMID, defs: [9] }
    { type: BUILDING_LARGE_STEPPED_PYRAMID, defs: [10] }
    { type: BUILDING_STEPPED_PYRAMID_COMPLEX, defs: [11] }
    { type: BUILDING_GRAND_STEPPED_PYRAMID_COMPLEX, defs: [12] }
    { type: BUILDING_SMALL_PYRAMID, defs: [13] }
    { type: BUILDING_MEDIUM_PYRAMID, defs: [14] }
    { type: BUILDING_LARGE_PYRAMID, defs: [15] }
    { type: BUILDING_PYRAMID_COMPLEX, defs: [16] }
    { type: BUILDING_GRAND_PYRAMID_COMPLEX, defs: [17] }
    { type: BUILDING_SMALL_MASTABA, defs: [18] }
    { type: BUILDING_MEDIUM_MASTABA, defs: [19] }
    { type: BUILDING_LARGE_MASTABA, defs: [20] }
    { type: BUILDING_SPHINX, defs: [21] }
    { type: BUILDING_SMALL_OBELISK, defs: [22] }
    { type: BUILDING_LARGE_OBELISK, defs: [23] }
    { type: BUILDING_SUN_TEMPLE, defs: [24] }
    { type: BUILDING_MAUSOLEUM, defs: [25, 26, 27] }
    { type: BUILDING_PHAROS_LIGHTHOUSE, defs: [28] }
    { type: BUILDING_ALEXANDRIA_LIBRARY, defs: [29] }
    { type: BUILDING_CAESAREUM, defs: [30] }
    { type: BUILDING_COLOSSI, defs: [31] }
    { type: BUILDING_TEMPLE_OF_LUXOR, defs: [32] }
    { type: BUILDING_SMALL_ROYAL_TOMB, defs: [33] }
    { type: BUILDING_MEDIUM_ROYAL_TOMB, defs: [34] }
    { type: BUILDING_LARGE_ROYAL_TOMB, defs: [35] }
    { type: BUILDING_GRAND_ROYAL_TOMB, defs: [36] }
    { type: BUILDING_ABU_SIMBEL, defs: [37] }
  ]
}

var MONUMENT_DEF_IDS = {}
for (var i = 0; i < monument_def_ids.types.length; i++) {
	MONUMENT_DEF_IDS[monument_def_ids.types[i].type] = monument_def_ids.types[i].defs
}

// The weight of a building type (its first def id).
var MONUMENT_WEIGHTS = {}
for (var monument_type in MONUMENT_DEF_IDS) {
	MONUMENT_WEIGHTS[monument_type] = MONUMENT_DEF_WEIGHTS[MONUMENT_DEF_IDS[monument_type][0]]
}

// OG city_burial_goal_divisor: every 32 loads of a material or 16 of goods sent to the tombs add a point.
var BURIAL_GOAL_DIVISORS = {}
BURIAL_GOAL_DIVISORS[RESOURCE_GRAIN]        = 32
BURIAL_GOAL_DIVISORS[RESOURCE_GAMEMEAT]     = 32
BURIAL_GOAL_DIVISORS[RESOURCE_GEMS]         = 32
BURIAL_GOAL_DIVISORS[RESOURCE_TIMBER]       = 32
BURIAL_GOAL_DIVISORS[RESOURCE_STONE]        = 32
BURIAL_GOAL_DIVISORS[RESOURCE_LIMESTONE]    = 32
BURIAL_GOAL_DIVISORS[RESOURCE_GRANITE]      = 32
BURIAL_GOAL_DIVISORS[RESOURCE_SANDSTONE]    = 32
BURIAL_GOAL_DIVISORS[RESOURCE_WEAPONS]      = 16
BURIAL_GOAL_DIVISORS[RESOURCE_POTTERY]      = 16
BURIAL_GOAL_DIVISORS[RESOURCE_BEER]         = 16
BURIAL_GOAL_DIVISORS[RESOURCE_LINEN]        = 16
BURIAL_GOAL_DIVISORS[RESOURCE_LUXURY_GOODS] = 16
BURIAL_GOAL_DIVISORS[RESOURCE_PAPYRUS]      = 16
BURIAL_GOAL_DIVISORS[RESOURCE_CHARIOTS]     = 16

var MONUMENT_RATING_FACTOR = 6.32
var MONUMENT_RATING_ROUNDING = 0.5

function monument_weight_btype(list_head_bid) {
	var cur = city.get_building(list_head_bid)
	var guard = 0
	while (cur && guard < 256) {
		guard++
		var t = cur.type
		if (typeof MONUMENT_DEF_IDS[t] !== 'undefined') {
			return t
		}
		if (!cur.next_part_building_id) {
			break
		}
		cur = city.get_building(cur.next_part_building_id)
	}
	return __building_type(list_head_bid)
}

function monument_scenario_slot_defs() {
	return [__scenario_monuments.first | 0, __scenario_monuments.second | 0, __scenario_monuments.third | 0]
}

// OG monument_register: each scenario slot takes the first built monument (lowest building id, in place of
// OG's build order) whose def id matches; a building takes one slot. Monuments carried over from an earlier
// mission are not built here and take no slot.
function city_monument_slot_buildings() {
	var defs = monument_scenario_slot_defs()
	var slots = [0, 0, 0]
	var n = __city_monuments_list_refresh()
	for (var i = 0; i < n; i++) {
		var bid = __city_monuments_list_id_at(i)
		var monument = bid ? city.get_monument(bid) : null
		if (!monument || monument.is_preexisting()) {
			continue
		}
		var ids = MONUMENT_DEF_IDS[monument_weight_btype(bid)]
		if (!ids) {
			continue
		}
		for (var slot = 0; slot < 3; slot++) {
			if (!slots[slot] && defs[slot] && ids.indexOf(defs[slot]) >= 0) {
				slots[slot] = bid
				break
			}
		}
	}
	return slots
}

function monument_progress_pct(monument) {
	var phase = monument.phase()
	if (phase == -1) {
		return 100
	}
	var phases = monument.phases_total()
	if (phases <= 0) {
		return 0
	}
	var progress = (((phase - 1) * 100 + monument.material_pct_min()) / phases) | 0
	if (progress < 0) {
		return 0
	}
	return (progress > 100) ? 100 : progress
}

function monument_burial_points() {
	var points = 0
	var n = __scenario_burial_provisions_count()
	for (var i = 0; i < n; i++) {
		var res = __scenario_burial_provisions_resource_at(i)
		var divisor = BURIAL_GOAL_DIVISORS[res]
		if (!divisor || !__scenario_burial_provisions_required(res)) {
			continue
		}
		points += (__scenario_burial_provisions_dispatched(res) / divisor) | 0
	}
	return points
}

// OG city_ratings_calculate_monument: 6.32 * sqrt(points) + 0.5, one less while a monument is unfinished;
// points = weight * progress% of each monument plus the burial goods share.
function monument_rating_from_points(points, unfinished) {
	var rating = Math.sqrt(points) * MONUMENT_RATING_FACTOR + MONUMENT_RATING_ROUNDING
	if (unfinished) {
		rating = Math.max(rating - 1.0, 0.0)
	}
	rating = rating | 0
	return (rating > 100) ? 100 : rating
}

function city_monument_rating() {
	var defs = monument_scenario_slot_defs()
	if (!defs[0] && !defs[1] && !defs[2]) {
		return 0
	}

	var points = 0
	var unfinished = false
	var slots = city_monument_slot_buildings()
	for (var slot = 0; slot < 3; slot++) {
		var monument = slots[slot] ? city.get_monument(slots[slot]) : null
		if (!monument) {
			continue
		}
		var progress = monument_progress_pct(monument)
		if (progress < 100) {
			unfinished = true
		}
		points += ((MONUMENT_DEF_WEIGHTS[defs[slot]] * progress) / 100) | 0
	}
	points += monument_burial_points()

	return monument_rating_from_points(points, unfinished)
}

[es=event_advance_month]
function city_update_monthly_monument_rating(ev) {
	__city_ratings_set_monument(city_monument_rating())
}

// OG victory_count_finished_monuments / city_victory_score: the finished slot monuments, their count and weight.
function city_finished_slot_monuments() {
	var defs = monument_scenario_slot_defs()
	var slots = city_monument_slot_buildings()
	var result = { count: 0, weight: 0 }
	for (var slot = 0; slot < 3; slot++) {
		var monument = slots[slot] ? city.get_monument(slots[slot]) : null
		if (!monument || monument_progress_pct(monument) < 100) {
			continue
		}
		result.count++
		result.weight += MONUMENT_DEF_WEIGHTS[defs[slot]]
	}
	return result
}
