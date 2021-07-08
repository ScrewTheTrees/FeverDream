udg_Dest_Scene1Arena1Entry1 = nil
udg_Dest_Scene1Arena1Exit1 = nil
udg_Dest_Scene1Arena2Entry1 = nil
udg_Dest_Scene1Arena2Exit1 = nil
gg_rct_Scene1Arena1Spawn1 = nil
gg_rct_Scene1Arena1Spawn2 = nil
gg_rct_Scene1Arena1Tardy1 = nil
gg_rct_Scene1Arena1Trigger1 = nil
gg_rct_Scene1Checkpoint1 = nil
gg_rct_Scene1Arena1Check1 = nil
gg_trg_InitScene1 = nil
gg_dest_ATg4_0002 = nil
gg_dest_ATg1_0003 = nil
gg_rct_Scene1Arena1Check2 = nil
gg_dest_ATg1_0004 = nil
gg_rct_Scene1Arena2Check1 = nil
gg_rct_Scene1Arena2Trigger1 = nil
gg_rct_Scene1Arena2Tardy1 = nil
gg_rct_Scene1Arena2Spawn1 = nil
function InitGlobals()
end

function CreateAllDestructables()
    local d
    local t
    local life
    gg_dest_ATg1_0003 = BlzCreateDestructableWithSkin(FourCC("ATg1"), -26304.0, -22720.0, 270.000, 0.900, 0, FourCC("ATg1"))
    gg_dest_ATg1_0004 = BlzCreateDestructableWithSkin(FourCC("ATg1"), -26112.0, -20480.0, 270.000, 0.900, 0, FourCC("ATg1"))
    gg_dest_ATg4_0002 = BlzCreateDestructableWithSkin(FourCC("ATg4"), -27488.0, -25120.0, 180.000, 1.000, 0, FourCC("ATg4"))
end

function CreateNeutralPassiveBuildings()
    local p = Player(PLAYER_NEUTRAL_PASSIVE)
    local u
    local unitID
    local t
    local life
    u = BlzCreateUnitWithSkin(p, FourCC("nfoh"), -27840.0, -28736.0, 270.000, FourCC("nfoh"))
end

function CreatePlayerBuildings()
end

function CreatePlayerUnits()
end

function CreateAllUnits()
    CreateNeutralPassiveBuildings()
    CreatePlayerBuildings()
    CreatePlayerUnits()
end

function CreateRegions()
    local we
    gg_rct_Scene1Arena1Spawn1 = Rect(-27616.0, -24576.0, -27424.0, -22944.0)
    gg_rct_Scene1Arena1Spawn2 = Rect(-27072.0, -25344.0, -25888.0, -25152.0)
    gg_rct_Scene1Arena1Tardy1 = Rect(-26464.0, -23296.0, -26272.0, -23104.0)
    gg_rct_Scene1Arena1Trigger1 = Rect(-26848.0, -23520.0, -25824.0, -22880.0)
    gg_rct_Scene1Checkpoint1 = Rect(-28416.0, -28928.0, -28032.0, -28544.0)
    gg_rct_Scene1Arena1Check1 = Rect(-27744.0, -24672.0, -25664.0, -22688.0)
    gg_rct_Scene1Arena1Check2 = Rect(-27136.0, -25472.0, -25696.0, -24288.0)
    gg_rct_Scene1Arena2Check1 = Rect(-27904.0, -22624.0, -25600.0, -20512.0)
    gg_rct_Scene1Arena2Trigger1 = Rect(-26848.0, -22400.0, -25824.0, -21760.0)
    gg_rct_Scene1Arena2Tardy1 = Rect(-26432.0, -22144.0, -26240.0, -21952.0)
    gg_rct_Scene1Arena2Spawn1 = Rect(-27744.0, -22368.0, -27552.0, -20672.0)
end

function Trig_InitScene1_Actions()
    udg_Dest_Scene1Arena1Entry1 = gg_dest_ATg4_0002
    udg_Dest_Scene1Arena1Exit1 = gg_dest_ATg1_0003
    udg_Dest_Scene1Arena2Entry1 = gg_dest_ATg1_0003
    udg_Dest_Scene1Arena2Exit1 = gg_dest_ATg1_0004
end

function InitTrig_InitScene1()
    gg_trg_InitScene1 = CreateTrigger()
    TriggerAddAction(gg_trg_InitScene1, Trig_InitScene1_Actions)
end

function InitCustomTriggers()
    InitTrig_InitScene1()
end

function RunInitializationTriggers()
    ConditionalTriggerExecute(gg_trg_InitScene1)
end

function InitCustomPlayerSlots()
    SetPlayerStartLocation(Player(0), 0)
    ForcePlayerStartLocation(Player(0), 0)
    SetPlayerColor(Player(0), ConvertPlayerColor(0))
    SetPlayerRacePreference(Player(0), RACE_PREF_HUMAN)
    SetPlayerRaceSelectable(Player(0), false)
    SetPlayerController(Player(0), MAP_CONTROL_USER)
    SetPlayerStartLocation(Player(1), 1)
    ForcePlayerStartLocation(Player(1), 1)
    SetPlayerColor(Player(1), ConvertPlayerColor(1))
    SetPlayerRacePreference(Player(1), RACE_PREF_HUMAN)
    SetPlayerRaceSelectable(Player(1), false)
    SetPlayerController(Player(1), MAP_CONTROL_USER)
    SetPlayerStartLocation(Player(2), 2)
    ForcePlayerStartLocation(Player(2), 2)
    SetPlayerColor(Player(2), ConvertPlayerColor(2))
    SetPlayerRacePreference(Player(2), RACE_PREF_HUMAN)
    SetPlayerRaceSelectable(Player(2), false)
    SetPlayerController(Player(2), MAP_CONTROL_USER)
    SetPlayerStartLocation(Player(3), 3)
    ForcePlayerStartLocation(Player(3), 3)
    SetPlayerColor(Player(3), ConvertPlayerColor(3))
    SetPlayerRacePreference(Player(3), RACE_PREF_HUMAN)
    SetPlayerRaceSelectable(Player(3), false)
    SetPlayerController(Player(3), MAP_CONTROL_USER)
    SetPlayerStartLocation(Player(4), 4)
    ForcePlayerStartLocation(Player(4), 4)
    SetPlayerColor(Player(4), ConvertPlayerColor(4))
    SetPlayerRacePreference(Player(4), RACE_PREF_UNDEAD)
    SetPlayerRaceSelectable(Player(4), false)
    SetPlayerController(Player(4), MAP_CONTROL_COMPUTER)
    SetPlayerStartLocation(Player(5), 5)
    ForcePlayerStartLocation(Player(5), 5)
    SetPlayerColor(Player(5), ConvertPlayerColor(5))
    SetPlayerRacePreference(Player(5), RACE_PREF_UNDEAD)
    SetPlayerRaceSelectable(Player(5), false)
    SetPlayerController(Player(5), MAP_CONTROL_COMPUTER)
end

function InitCustomTeams()
    SetPlayerTeam(Player(0), 0)
    SetPlayerState(Player(0), PLAYER_STATE_ALLIED_VICTORY, 1)
    SetPlayerTeam(Player(1), 0)
    SetPlayerState(Player(1), PLAYER_STATE_ALLIED_VICTORY, 1)
    SetPlayerTeam(Player(2), 0)
    SetPlayerState(Player(2), PLAYER_STATE_ALLIED_VICTORY, 1)
    SetPlayerTeam(Player(3), 0)
    SetPlayerState(Player(3), PLAYER_STATE_ALLIED_VICTORY, 1)
    SetPlayerAllianceStateAllyBJ(Player(0), Player(1), true)
    SetPlayerAllianceStateAllyBJ(Player(0), Player(2), true)
    SetPlayerAllianceStateAllyBJ(Player(0), Player(3), true)
    SetPlayerAllianceStateAllyBJ(Player(1), Player(0), true)
    SetPlayerAllianceStateAllyBJ(Player(1), Player(2), true)
    SetPlayerAllianceStateAllyBJ(Player(1), Player(3), true)
    SetPlayerAllianceStateAllyBJ(Player(2), Player(0), true)
    SetPlayerAllianceStateAllyBJ(Player(2), Player(1), true)
    SetPlayerAllianceStateAllyBJ(Player(2), Player(3), true)
    SetPlayerAllianceStateAllyBJ(Player(3), Player(0), true)
    SetPlayerAllianceStateAllyBJ(Player(3), Player(1), true)
    SetPlayerAllianceStateAllyBJ(Player(3), Player(2), true)
    SetPlayerAllianceStateVisionBJ(Player(0), Player(1), true)
    SetPlayerAllianceStateVisionBJ(Player(0), Player(2), true)
    SetPlayerAllianceStateVisionBJ(Player(0), Player(3), true)
    SetPlayerAllianceStateVisionBJ(Player(1), Player(0), true)
    SetPlayerAllianceStateVisionBJ(Player(1), Player(2), true)
    SetPlayerAllianceStateVisionBJ(Player(1), Player(3), true)
    SetPlayerAllianceStateVisionBJ(Player(2), Player(0), true)
    SetPlayerAllianceStateVisionBJ(Player(2), Player(1), true)
    SetPlayerAllianceStateVisionBJ(Player(2), Player(3), true)
    SetPlayerAllianceStateVisionBJ(Player(3), Player(0), true)
    SetPlayerAllianceStateVisionBJ(Player(3), Player(1), true)
    SetPlayerAllianceStateVisionBJ(Player(3), Player(2), true)
    SetPlayerTeam(Player(4), 1)
    SetPlayerTeam(Player(5), 1)
end

function InitAllyPriorities()
    SetStartLocPrioCount(0, 3)
    SetStartLocPrio(0, 0, 1, MAP_LOC_PRIO_HIGH)
    SetStartLocPrio(0, 1, 2, MAP_LOC_PRIO_HIGH)
    SetStartLocPrio(0, 2, 3, MAP_LOC_PRIO_LOW)
    SetStartLocPrioCount(1, 3)
    SetStartLocPrio(1, 0, 0, MAP_LOC_PRIO_HIGH)
    SetStartLocPrio(1, 1, 2, MAP_LOC_PRIO_LOW)
    SetStartLocPrio(1, 2, 3, MAP_LOC_PRIO_HIGH)
    SetStartLocPrioCount(2, 3)
    SetStartLocPrio(2, 0, 0, MAP_LOC_PRIO_HIGH)
    SetStartLocPrio(2, 1, 1, MAP_LOC_PRIO_LOW)
    SetStartLocPrio(2, 2, 3, MAP_LOC_PRIO_HIGH)
    SetStartLocPrioCount(3, 3)
    SetStartLocPrio(3, 0, 0, MAP_LOC_PRIO_LOW)
    SetStartLocPrio(3, 1, 1, MAP_LOC_PRIO_HIGH)
    SetStartLocPrio(3, 2, 2, MAP_LOC_PRIO_HIGH)
end

function main()
    SetCameraBounds(-29952.0 + GetCameraMargin(CAMERA_MARGIN_LEFT), -30208.0 + GetCameraMargin(CAMERA_MARGIN_BOTTOM), 29952.0 - GetCameraMargin(CAMERA_MARGIN_RIGHT), 29696.0 - GetCameraMargin(CAMERA_MARGIN_TOP), -29952.0 + GetCameraMargin(CAMERA_MARGIN_LEFT), 29696.0 - GetCameraMargin(CAMERA_MARGIN_TOP), 29952.0 - GetCameraMargin(CAMERA_MARGIN_RIGHT), -30208.0 + GetCameraMargin(CAMERA_MARGIN_BOTTOM))
    SetDayNightModels("Environment\\DNC\\DNCAshenvale\\DNCAshenvaleTerrain\\DNCAshenvaleTerrain.mdl", "Environment\\DNC\\DNCAshenvale\\DNCAshenvaleUnit\\DNCAshenvaleUnit.mdl")
    NewSoundEnvironment("Default")
    SetAmbientDaySound("AshenvaleDay")
    SetAmbientNightSound("AshenvaleNight")
    SetMapMusic("Music", true, 0)
    CreateRegions()
    CreateAllDestructables()
    CreateAllUnits()
    InitBlizzard()
    InitGlobals()
    InitCustomTriggers()
    RunInitializationTriggers()
end

function config()
    SetMapName("TRIGSTR_003")
    SetMapDescription("TRIGSTR_005")
    SetPlayers(6)
    SetTeams(6)
    SetGamePlacement(MAP_PLACEMENT_TEAMS_TOGETHER)
    DefineStartLocation(0, -28928.0, -28800.0)
    DefineStartLocation(1, -28544.0, -28800.0)
    DefineStartLocation(2, -28928.0, -29184.0)
    DefineStartLocation(3, -28544.0, -29184.0)
    DefineStartLocation(4, 9408.0, 4608.0)
    DefineStartLocation(5, 23360.0, 13376.0)
    InitCustomPlayerSlots()
    InitCustomTeams()
    InitAllyPriorities()
end

