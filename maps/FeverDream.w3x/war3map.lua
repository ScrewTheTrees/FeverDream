udg_Dest_Arena1Entry1 = nil
udg_Dest_Arena1Exit1 = nil
udg_Dest_Arena2Entry1 = nil
udg_Dest_Arena2Exit1 = nil
udg_Dest_Arena3Exit1 = nil
udg_Dest_Arena3Exit2 = nil
udg_Dest_Arena3Exit3 = nil
gg_rct_Arena1Spawn1 = nil
gg_rct_Arena1Spawn2 = nil
gg_rct_Arena1Tardy1 = nil
gg_rct_Arena1Trigger1 = nil
gg_rct_Scene1Start = nil
gg_rct_Arena1Check1 = nil
gg_rct_Arena2Check1 = nil
gg_rct_Arena2Trigger1 = nil
gg_rct_Arena2Tardy1 = nil
gg_rct_Arena2Spawn1 = nil
gg_rct_Scene1Camera1 = nil
gg_rct_Scene2Ending = nil
gg_rct_Arena2Camera1 = nil
gg_rct_SceneCaveStart = nil
gg_rct_Scene2Start = nil
gg_rct_ArenaCaveSpawn1 = nil
gg_rct_ArenaCaveTriggerStart = nil
gg_rct_ArenaCaveSpawn2 = nil
gg_rct_ArenaCaveSpawn3 = nil
gg_rct_ArenaCaveSpawn4 = nil
gg_rct_ArenaCaveSpawn5 = nil
gg_rct_GodRays1 = nil
gg_rct_ArenaCaveTrigger1 = nil
gg_rct_ArenaCaveTrigger2 = nil
gg_rct_ArenaCaveTrigger3 = nil
gg_rct_BlueFog1 = nil
gg_rct_Secret1 = nil
gg_rct_Arena2WaterfallL1 = nil
gg_rct_ArenaCaveWaterfallL1 = nil
gg_rct_ArenaCaveWaterfallR1 = nil
gg_rct_ArenaCaveSpecialSpawn2 = nil
gg_rct_ArenaCaveSpecialSpawn2PowerCheck = nil
gg_rct_ArenaCaveFirstGateGuard = nil
gg_trg_InitScene1 = nil
gg_dest_ATg4_0002 = nil
gg_dest_ATg1_0003 = nil
gg_dest_ATg1_0004 = nil
gg_dest_DTg5_0763 = nil
gg_dest_DTg5_0762 = nil
gg_dest_DTg5_0755 = nil
function InitGlobals()
end

function CreateAllDestructables()
    local d
    local t
    local life
    gg_dest_ATg1_0003 = BlzCreateDestructableWithSkin(FourCC("ATg1"), -26304.0, -22720.0, 270.000, 0.900, 0, FourCC("ATg1"))
    gg_dest_ATg1_0004 = BlzCreateDestructableWithSkin(FourCC("ATg1"), -26112.0, -20480.0, 270.000, 0.900, 0, FourCC("ATg1"))
    gg_dest_ATg4_0002 = BlzCreateDestructableWithSkin(FourCC("ATg4"), -27488.0, -25120.0, 180.000, 1.000, 0, FourCC("ATg4"))
    gg_dest_DTg5_0762 = BlzCreateDestructableWithSkin(FourCC("DTg5"), -22080.0, -8128.0, 270.000, 0.900, 0, FourCC("DTg5"))
    gg_dest_DTg5_0755 = BlzCreateDestructableWithSkin(FourCC("DTg5"), -22080.0, -9024.0, 270.000, 0.900, 0, FourCC("DTg5"))
    gg_dest_DTg5_0763 = BlzCreateDestructableWithSkin(FourCC("DTg5"), -22080.0, -7296.0, 270.000, 0.900, 0, FourCC("DTg5"))
end

function CreateRegions()
    local we
    gg_rct_Arena1Spawn1 = Rect(-24832.0, -24320.0, -24256.0, -23328.0)
    gg_rct_Arena1Spawn2 = Rect(-27296.0, -24224.0, -26688.0, -23232.0)
    gg_rct_Arena1Tardy1 = Rect(-26400.0, -23968.0, -26208.0, -23776.0)
    gg_rct_Arena1Trigger1 = Rect(-26528.0, -24736.0, -25952.0, -22784.0)
    gg_rct_Scene1Start = Rect(-28032.0, -29408.0, -27680.0, -29024.0)
    gg_rct_Arena1Check1 = Rect(-27712.0, -24736.0, -23616.0, -22688.0)
    gg_rct_Arena2Check1 = Rect(-27904.0, -22528.0, -25600.0, -20512.0)
    we = AddWeatherEffect(gg_rct_Arena2Check1, FourCC("FDbl"))
    EnableWeatherEffect(we, true)
    gg_rct_Arena2Trigger1 = Rect(-26848.0, -21568.0, -25632.0, -20480.0)
    gg_rct_Arena2Tardy1 = Rect(-26240.0, -21248.0, -26048.0, -21056.0)
    gg_rct_Arena2Spawn1 = Rect(-27744.0, -22048.0, -27456.0, -21024.0)
    gg_rct_Scene1Camera1 = Rect(-25376.0, -24032.0, -25120.0, -23744.0)
    gg_rct_Scene2Ending = Rect(-26592.0, -18784.0, -26272.0, -18528.0)
    gg_rct_Arena2Camera1 = Rect(-27296.0, -21696.0, -27040.0, -21408.0)
    gg_rct_SceneCaveStart = Rect(-28192.0, -15648.0, -27744.0, -15232.0)
    gg_rct_Scene2Start = Rect(-25888.0, -23296.0, -25568.0, -22976.0)
    we = AddWeatherEffect(gg_rct_Scene2Start, FourCC("FDgh"))
    EnableWeatherEffect(we, true)
    gg_rct_ArenaCaveSpawn1 = Rect(-29120.0, -8640.0, -28736.0, -8256.0)
    gg_rct_ArenaCaveTriggerStart = Rect(-28544.0, -15040.0, -27328.0, -14144.0)
    gg_rct_ArenaCaveSpawn2 = Rect(-28256.0, -15584.0, -27936.0, -15264.0)
    gg_rct_ArenaCaveSpawn3 = Rect(-24480.0, -14144.0, -24128.0, -13888.0)
    gg_rct_ArenaCaveSpawn4 = Rect(-20448.0, -9408.0, -20128.0, -9120.0)
    gg_rct_ArenaCaveSpawn5 = Rect(-24416.0, -20544.0, -24096.0, -20224.0)
    gg_rct_GodRays1 = Rect(-29056.0, -13152.0, -28672.0, -12800.0)
    we = AddWeatherEffect(gg_rct_GodRays1, FourCC("LRaa"))
    EnableWeatherEffect(we, true)
    gg_rct_ArenaCaveTrigger1 = Rect(-28832.0, -11552.0, -28640.0, -11360.0)
    gg_rct_ArenaCaveTrigger2 = Rect(-29024.0, -8544.0, -28832.0, -8352.0)
    gg_rct_ArenaCaveTrigger3 = Rect(-24352.0, -20640.0, -24160.0, -20448.0)
    gg_rct_BlueFog1 = Rect(-24736.0, -15136.0, -22592.0, -13696.0)
    we = AddWeatherEffect(gg_rct_BlueFog1, FourCC("FDbh"))
    EnableWeatherEffect(we, true)
    gg_rct_Secret1 = Rect(-24704.0, -21504.0, -24192.0, -20864.0)
    gg_rct_Arena2WaterfallL1 = Rect(-25792.0, -21312.0, -24576.0, -21088.0)
    gg_rct_ArenaCaveWaterfallL1 = Rect(-29216.0, -9312.0, -26624.0, -8992.0)
    gg_rct_ArenaCaveWaterfallR1 = Rect(-24800.0, -14240.0, -24032.0, -13856.0)
    gg_rct_ArenaCaveSpecialSpawn2 = Rect(-27392.0, -9248.0, -27168.0, -9056.0)
    gg_rct_ArenaCaveSpecialSpawn2PowerCheck = Rect(-29216.0, -10048.0, -26176.0, -8128.0)
    gg_rct_ArenaCaveFirstGateGuard = Rect(-22336.0, -10368.0, -21824.0, -10016.0)
end

function Trig_InitScene1_Actions()
    udg_Dest_Arena1Entry1 = gg_dest_ATg4_0002
    udg_Dest_Arena1Exit1 = gg_dest_ATg1_0003
    udg_Dest_Arena2Entry1 = gg_dest_ATg1_0003
    udg_Dest_Arena2Exit1 = gg_dest_ATg1_0004
    udg_Dest_Arena3Exit1 = gg_dest_DTg5_0755
    udg_Dest_Arena3Exit2 = gg_dest_DTg5_0762
    udg_Dest_Arena3Exit3 = gg_dest_DTg5_0763
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
    SetPlayerColor(Player(0), ConvertPlayerColor(0))
    SetPlayerRacePreference(Player(0), RACE_PREF_HUMAN)
    SetPlayerRaceSelectable(Player(0), true)
    SetPlayerController(Player(0), MAP_CONTROL_USER)
    SetPlayerStartLocation(Player(1), 1)
    SetPlayerColor(Player(1), ConvertPlayerColor(1))
    SetPlayerRacePreference(Player(1), RACE_PREF_HUMAN)
    SetPlayerRaceSelectable(Player(1), true)
    SetPlayerController(Player(1), MAP_CONTROL_USER)
    SetPlayerStartLocation(Player(2), 2)
    SetPlayerColor(Player(2), ConvertPlayerColor(2))
    SetPlayerRacePreference(Player(2), RACE_PREF_HUMAN)
    SetPlayerRaceSelectable(Player(2), true)
    SetPlayerController(Player(2), MAP_CONTROL_USER)
    SetPlayerStartLocation(Player(3), 3)
    SetPlayerColor(Player(3), ConvertPlayerColor(3))
    SetPlayerRacePreference(Player(3), RACE_PREF_HUMAN)
    SetPlayerRaceSelectable(Player(3), true)
    SetPlayerController(Player(3), MAP_CONTROL_USER)
end

function InitCustomTeams()
    SetPlayerTeam(Player(0), 0)
    SetPlayerTeam(Player(1), 0)
    SetPlayerTeam(Player(2), 0)
    SetPlayerTeam(Player(3), 0)
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
    InitBlizzard()
    InitGlobals()
    InitCustomTriggers()
    RunInitializationTriggers()
end

function config()
    SetMapName("TRIGSTR_003")
    SetMapDescription("TRIGSTR_005")
    SetPlayers(4)
    SetTeams(4)
    SetGamePlacement(MAP_PLACEMENT_TEAMS_TOGETHER)
    DefineStartLocation(0, -27968.0, -29312.0)
    DefineStartLocation(1, -27968.0, -29120.0)
    DefineStartLocation(2, -27776.0, -29312.0)
    DefineStartLocation(3, -27776.0, -29120.0)
    InitCustomPlayerSlots()
    SetPlayerSlotAvailable(Player(0), MAP_CONTROL_USER)
    SetPlayerSlotAvailable(Player(1), MAP_CONTROL_USER)
    SetPlayerSlotAvailable(Player(2), MAP_CONTROL_USER)
    SetPlayerSlotAvailable(Player(3), MAP_CONTROL_USER)
    InitGenericPlayerSlots()
    InitAllyPriorities()
end

