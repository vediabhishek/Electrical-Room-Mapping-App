import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from "react-router-dom";
import { 
  Plus, 
  ChevronRight, 
  Building2, 
  Layers, 
  DoorOpen, 
  LayoutGrid, 
  Camera, 
  FileText, 
  Trash2, 
  Edit2,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Zap,
  Power,
  ToggleLeft,
  ToggleRight,
  Wind,
  Settings2,
  Cpu,
  Plug2,
  Fan,
  Snowflake,
  Sun,
  Bell,
  Smartphone,
  Wifi,
  Bluetooth,
  Timer,
  Activity,
  Eye,
  ShieldAlert,
  ShieldCheck,
  Shield,
  Tv,
  Phone,
  Network,
  Monitor,
  Speaker,
  Square,
  Moon,
  Key,
  AlertTriangle,
  Usb,
  Plug,
  Thermometer,
  Droplets,
  Lightbulb,
  MousePointer2,
  Dices,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// --- Utilities ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const COMPONENT_TYPES = [
  // Switches
  { id: "1_way_switch", label: "1-Way Switch", icon: ToggleRight, category: "Switches" },
  { id: "2_way_switch", label: "2-Way Switch", icon: ToggleRight, category: "Switches" },
  { id: "intermediate_switch", label: "Intermediate Switch", icon: ToggleRight, category: "Switches" },
  { id: "bell_push_switch", label: "Bell Push Switch", icon: Bell, category: "Switches" },
  { id: "dp_switch", label: "Double Pole (DP) Switch", icon: Power, category: "Switches" },
  { id: "smart_touch_switch", label: "Smart Touch Switch", icon: MousePointer2, category: "Switches" },
  { id: "dimmer_switch", label: "Dimmer Switch", icon: Sun, category: "Switches" },
  { id: "ac_switch", label: "AC Switch", icon: Snowflake, category: "Switches" },
  { id: "geyser_switch", label: "Geyser Switch", icon: Droplets, category: "Switches" },
  { id: "exhaust_fan_switch", label: "Exhaust Fan Switch", icon: Wind, category: "Switches" },
  { id: "water_pump_switch", label: "Water Pump Switch", icon: Droplets, category: "Switches" },
  { id: "door_bell_switch", label: "Door Bell Switch", icon: Bell, category: "Switches" },
  { id: "timer_switch", label: "Timer Switch", icon: Timer, category: "Switches" },
  { id: "emergency_switch", label: "Emergency Switch", icon: AlertTriangle, category: "Switches" },
  { id: "voltage_stabilizer_switch", label: "Voltage Stabilizer Switch", icon: Zap, category: "Switches" },
  { id: "keycard_switch", label: "Keycard Switch", icon: Key, category: "Switches" },

  // Regulators
  { id: "fan_regulator", label: "Fan Regulator", icon: Fan, category: "Regulators" },
  { id: "step_fan_regulator", label: "Step Fan Regulator", icon: Fan, category: "Regulators" },
  { id: "electronic_fan_regulator", label: "Electronic Fan Regulator", icon: Fan, category: "Regulators" },
  { id: "dimmer_fan_regulator", label: "Dimmer with Fan Regulator", icon: Dices, category: "Regulators" },

  // Sockets
  { id: "2_pin_socket", label: "2-Pin Socket", icon: Plug, category: "Sockets" },
  { id: "3_pin_socket", label: "3-Pin Socket", icon: Plug2, category: "Sockets" },
  { id: "5a_socket", label: "5A Socket", icon: Plug2, category: "Sockets" },
  { id: "15a_socket", label: "15A Socket", icon: Plug2, category: "Sockets" },
  { id: "universal_socket", label: "Universal Socket", icon: Plug2, category: "Sockets" },
  { id: "usb_charging_socket", label: "USB Charging Socket", icon: Usb, category: "Sockets" },
  { id: "usb_c_charging_socket", label: "USB-C Charging Socket", icon: Usb, category: "Sockets" },
  { id: "power_socket_switch", label: "Power Socket with Switch", icon: Zap, category: "Sockets" },
  { id: "shaver_socket", label: "Shaver Socket", icon: Plug, category: "Sockets" },

  // Smart & Sensors
  { id: "smart_wifi_switch", label: "Smart WiFi Switch", icon: Wifi, category: "Smart" },
  { id: "zigbee_smart_switch", label: "Zigbee Smart Switch", icon: Cpu, category: "Smart" },
  { id: "bluetooth_smart_switch", label: "Bluetooth Smart Switch", icon: Bluetooth, category: "Smart" },
  { id: "touch_panel_switch", label: "Touch Panel Switch", icon: LayoutGrid, category: "Smart" },
  { id: "motion_sensor_switch", label: "Motion Sensor Switch", icon: Activity, category: "Smart" },
  { id: "light_sensor_switch", label: "Light Sensor Switch", icon: Eye, category: "Smart" },
  { id: "scene_control_panel", label: "Scene Control Panel", icon: LayoutGrid, category: "Smart" },
  { id: "smart_button", label: "Smart Button", icon: Smartphone, category: "Smart" },

  // Protection
  { id: "mcb", label: "MCB", icon: Shield, category: "Protection" },
  { id: "rccb", label: "RCCB", icon: ShieldAlert, category: "Protection" },
  { id: "elcb", label: "ELCB", icon: ShieldAlert, category: "Protection" },
  { id: "rcbo", label: "RCBO", icon: ShieldCheck, category: "Protection" },
  { id: "fuse_holder", icon: Zap, label: "Fuse Holder", category: "Protection" },

  // Communication & Media
  { id: "tv_socket", label: "TV Cable Socket", icon: Tv, category: "Media" },
  { id: "telephone_socket", label: "Telephone Socket", icon: Phone, category: "Media" },
  { id: "lan_socket", label: "Ethernet / LAN Socket", icon: Network, category: "Media" },
  { id: "hdmi_socket", label: "HDMI Wall Socket", icon: Monitor, category: "Media" },
  { id: "speaker_socket", label: "Speaker Wall Socket", icon: Speaker, category: "Media" },

  // Indicators & Modules
  { id: "led_indicator", label: "Light Indicator (LED)", icon: Lightbulb, category: "Indicators" },
  { id: "neon_indicator", label: "Neon Indicator", icon: Lightbulb, category: "Indicators" },
  { id: "night_lamp", label: "Night Lamp Module", icon: Moon, category: "Indicators" },
  { id: "blank_plate", label: "Blank Plate / Dummy Plate", icon: Square, category: "Other" },
];

// --- Components ---

const Header = ({ title, backTo, actions }: { title: string; backTo?: string; actions?: React.ReactNode }) => {
  const navigate = useNavigate();
  
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {backTo && (
          <button 
            onClick={() => backTo === "#" ? navigate(-1) : navigate(backTo)} 
            className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
        )}
        <h1 className="text-lg font-semibold text-slate-900 truncate max-w-[200px]">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        {actions}
      </div>
    </header>
  );
};

const Card = ({ children, className, onClick, ...props }: { children: React.ReactNode; className?: string; onClick?: () => void; [key: string]: any }) => (
  <motion.div
    whileHover={onClick ? { scale: 0.98 } : undefined}
    whileTap={onClick ? { scale: 0.96 } : undefined}
    onClick={onClick}
    className={cn(
      "bg-white border border-slate-200 rounded-2xl p-4 shadow-sm transition-all",
      onClick && "cursor-pointer hover:border-indigo-300 hover:shadow-md",
      className
    )}
    {...props}
  >
    {children}
  </motion.div>
);

const Button = ({ 
  children, 
  className, 
  variant = "primary", 
  size = "md",
  isLoading,
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}) => {
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200",
    secondary: "bg-slate-800 text-white hover:bg-slate-900 shadow-slate-200",
    outline: "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50",
    danger: "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100"
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5",
    lg: "px-6 py-3 text-lg font-medium"
  };

  return (
    <button 
      className={cn(
        "rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
    </button>
  );
};

// --- Views ---

const StartScreen = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 space-y-8"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-500/20 rotate-12">
            <Zap className="w-12 h-12 text-white fill-white" />
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-white tracking-tighter">VoltMap</h1>
            <p className="text-indigo-400 font-medium tracking-widest uppercase text-xs">Electrical Mapping Pro</p>
          </div>
        </div>

        <div className="space-y-4 max-w-xs mx-auto">
          <p className="text-slate-400 text-sm leading-relaxed">
            Professional electrical room mapping with AI-powered component detection and instant PDF reporting.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 pt-4">
          {[
            { icon: Camera, text: "AI Component Detection" },
            { icon: FileText, text: "Instant PDF Reports" },
            { icon: LayoutGrid, text: "Hierarchical Mapping" }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + (i * 0.1) }}
              className="flex items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-2xl backdrop-blur-sm"
            >
              <feature.icon className="w-5 h-5 text-indigo-400" />
              <span className="text-white/80 text-sm font-medium">{feature.text}</span>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="pt-8"
        >
          <Button 
            size="lg" 
            className="w-full h-16 text-lg font-bold rounded-2xl bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/20"
            onClick={() => navigate("/buildings")}
          >
            Get Started
            <ChevronRight className="w-5 h-5" />
          </Button>
        </motion.div>
      </motion.div>

      <div className="absolute bottom-8 left-0 w-full text-center">
        <p className="text-slate-600 text-[10px] uppercase tracking-[0.2em] font-bold">Version 2.0 • Powered by AI</p>
      </div>
    </div>
  );
};

const BuildingList = () => {
  const [buildings, setBuildings] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<any>(null);
  const [newName, setNewName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/buildings")
      .then(res => res.json())
      .then(data => {
        setBuildings(data);
        setIsLoading(false);
      });
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const res = await fetch("/api/buildings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName })
    });
    const data = await res.json();
    setBuildings([{ id: data.id, name: newName, created_at: new Date().toISOString() }, ...buildings]);
    setNewName("");
    setIsAdding(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !editingBuilding) return;
    await fetch(`/api/buildings/${editingBuilding.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName })
    });
    setBuildings(buildings.map(b => b.id === editingBuilding.id ? { ...b, name: newName } : b));
    setNewName("");
    setEditingBuilding(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this building? All floors and rooms will be removed.")) return;
    await fetch(`/api/buildings/${id}`, { method: "DELETE" });
    setBuildings(buildings.filter(b => b.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Header title="VoltMap" actions={
        <Button size="sm" onClick={() => setIsAdding(true)}><Plus className="w-4 h-4" /> New</Button>
      } />
      
      <main className="p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
        ) : buildings.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <Building2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No buildings mapped yet.</p>
          </div>
        ) : (
          buildings.map(b => (
            <div key={b.id} className="relative group">
              <Link to={`/buildings/${b.id}`}>
                <Card className="flex items-center justify-between mb-3 pr-12">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{b.name}</h3>
                      <p className="text-xs text-slate-500">{new Date(b.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300" />
                </Card>
              </Link>
              <div className="absolute right-12 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    setEditingBuilding(b);
                    setNewName(b.name);
                  }}
                  className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 hover:border-indigo-200 shadow-sm"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete(b.id);
                  }}
                  className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-red-600 hover:border-red-200 shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </main>

      <AnimatePresence>
        {(isAdding || editingBuilding) && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900">{editingBuilding ? "Edit Building" : "Add Building"}</h2>
                <button onClick={() => { setIsAdding(false); setEditingBuilding(null); setNewName(""); }} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={editingBuilding ? handleUpdate : handleAdd} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Building Name</label>
                  <input 
                    autoFocus
                    type="text" 
                    value={newName} 
                    onChange={e => setNewName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder="e.g. Skyline Apartments"
                  />
                </div>
                <Button type="submit" className="w-full" size="lg">{editingBuilding ? "Update Building" : "Create Building"}</Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FloorList = () => {
  const { buildingId } = useParams();
  const [floors, setFloors] = useState<any[]>([]);
  const [building, setBuilding] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingFloor, setEditingFloor] = useState<any>(null);
  const [newName, setNewName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/buildings`)
      .then(res => res.json())
      .then(data => setBuilding(data.find((b: any) => b.id === Number(buildingId))));

    fetch(`/api/buildings/${buildingId}/floors`)
      .then(res => res.json())
      .then(data => {
        setFloors(data);
        setIsLoading(false);
      });
  }, [buildingId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const res = await fetch(`/api/buildings/${buildingId}/floors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName })
    });
    const data = await res.json();
    setFloors([...floors, { id: data.id, name: newName }]);
    setNewName("");
    setIsAdding(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !editingFloor) return;
    await fetch(`/api/floors/${editingFloor.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName })
    });
    setFloors(floors.map(f => f.id === editingFloor.id ? { ...f, name: newName } : f));
    setNewName("");
    setEditingFloor(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this floor? All rooms will be removed.")) return;
    await fetch(`/api/floors/${id}`, { method: "DELETE" });
    setFloors(floors.filter(f => f.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title={building?.name || "Floors"} backTo="/buildings" actions={
        <Button size="sm" onClick={() => setIsAdding(true)}><Plus className="w-4 h-4" /> Add Floor</Button>
      } />
      
      <main className="p-4 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
        ) : floors.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <Layers className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No floors added yet.</p>
          </div>
        ) : (
          floors.map(f => (
            <div key={f.id} className="relative group">
              <Link to={`/floors/${f.id}`}>
                <Card className="flex items-center justify-between pr-12">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                      <Layers className="w-5 h-5" />
                    </div>
                    <h3 className="font-medium text-slate-900">{f.name}</h3>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300" />
                </Card>
              </Link>
              <div className="absolute right-12 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    setEditingFloor(f);
                    setNewName(f.name);
                  }}
                  className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 hover:border-indigo-200 shadow-sm"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete(f.id);
                  }}
                  className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-red-600 hover:border-red-200 shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </main>

      <AnimatePresence>
        {(isAdding || editingFloor) && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900">{editingFloor ? "Edit Floor" : "Add Floor"}</h2>
                <button onClick={() => { setIsAdding(false); setEditingFloor(null); setNewName(""); }} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={editingFloor ? handleUpdate : handleAdd} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Floor Name/Number</label>
                  <input 
                    autoFocus
                    type="text" 
                    value={newName} 
                    onChange={e => setNewName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Ground Floor, 1st Floor"
                  />
                </div>
                <Button type="submit" className="w-full" size="lg">{editingFloor ? "Update Floor" : "Add Floor"}</Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const RoomList = () => {
  const { floorId } = useParams();
  const [rooms, setRooms] = useState<any[]>([]);
  const [floor, setFloor] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newRoom, setNewRoom] = useState({ name: "", type: "Bedroom", size: "" });

  useEffect(() => {
    fetch(`/api/floors/${floorId}/rooms`)
      .then(res => res.json())
      .then(data => {
        setRooms(data);
        setIsLoading(false);
      });
  }, [floorId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoom.name.trim()) return;
    const res = await fetch(`/api/floors/${floorId}/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newRoom)
    });
    const data = await res.json();
    setRooms([...rooms, { id: data.id, ...newRoom }]);
    setNewRoom({ name: "", type: "Bedroom", size: "" });
    setIsAdding(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoom.name.trim() || !editingRoom) return;
    await fetch(`/api/rooms/${editingRoom.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newRoom)
    });
    setRooms(rooms.map(r => r.id === editingRoom.id ? { ...r, ...newRoom } : r));
    setNewRoom({ name: "", type: "Bedroom", size: "" });
    setEditingRoom(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this room? All electrical data will be lost.")) return;
    await fetch(`/api/rooms/${id}`, { method: "DELETE" });
    setRooms(rooms.filter(r => r.id !== id));
  };

  const generateFloorReport = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/floors/${floorId}/report`);
      const data = await res.json();
      const { building_name, floor_name, rooms } = data;
      
      const doc = new jsPDF();
      const primaryColor: [number, number, number] = [79, 70, 229]; // Indigo-600
      const secondaryColor: [number, number, number] = [100, 116, 139]; // Slate-500
      const darkColor: [number, number, number] = [15, 23, 42]; // Slate-900
      
      // --- 1. Cover Page ---
      // Background accent
      doc.setFillColor(248, 250, 252); // Slate-50
      doc.rect(0, 0, 210, 297, "F");
      
      doc.setFillColor(79, 70, 229);
      doc.rect(0, 0, 210, 10, "F");
      
      // Logo/Icon Placeholder
      doc.setFillColor(79, 70, 229);
      doc.roundedRect(85, 40, 40, 40, 8, 8, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(30);
      doc.text("V", 105, 68, { align: "center" });
      
      // Title
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.setFontSize(32);
      doc.setFont("helvetica", "bold");
      doc.text("Electrical Mapping Report", 105, 100, { align: "center" });
      
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(1);
      doc.line(70, 110, 140, 110);
      
      // Details
      doc.setFontSize(16);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text("PROJECT DETAILS", 105, 135, { align: "center" });
      
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.setFontSize(14);
      doc.text(`Building: ${building_name}`, 105, 150, { align: "center" });
      doc.text(`Floor: ${floor_name}`, 105, 160, { align: "center" });
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 105, 170, { align: "center" });
      
      doc.setFontSize(10);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text("Generated by VoltMap AI Professional", 105, 270, { align: "center" });
      doc.text("v2.0 • Electrical Mapping Solutions", 105, 276, { align: "center" });

      // --- 2. Summary Page ---
      doc.addPage();
      doc.setFontSize(20);
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.text("Floor Summary", 14, 25);
      
      const summaryData = rooms.map((r: any) => {
        const boardCount = r.boards.length;
        const totalComponents = r.boards.reduce((acc: number, b: any) => 
          acc + b.components.reduce((cAcc: number, c: any) => cAcc + c.count, 0), 0
        );
        return [r.name, r.type, boardCount, totalComponents];
      });

      autoTable(doc, {
        startY: 35,
        head: [["Room Name", "Type", "Boards", "Total Components"]],
        body: summaryData,
        theme: "grid",
        headStyles: { fillColor: primaryColor },
        styles: { fontSize: 10 },
      });

      // Aggregate Components Summary
      const floorComponents: Record<string, number> = {};
      rooms.forEach((r: any) => {
        r.boards.forEach((b: any) => {
          b.components.forEach((c: any) => {
            const label = COMPONENT_TYPES.find(t => t.id === c.type)?.label || c.type;
            floorComponents[label] = (floorComponents[label] || 0) + c.count;
          });
        });
      });

      const componentSummaryData = Object.entries(floorComponents)
        .sort((a, b) => b[1] - a[1])
        .map(([label, count]) => [label, count]);

      doc.setFontSize(16);
      doc.text("Total Component Breakdown", 14, (doc as any).lastAutoTable.finalY + 20);

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 25,
        head: [["Component Type", "Total Quantity"]],
        body: componentSummaryData,
        theme: "striped",
        headStyles: { fillColor: secondaryColor },
        styles: { fontSize: 10 },
      });

      // --- 3. Room Detail Pages ---
      rooms.forEach((room: any) => {
        doc.addPage();
        
        // Header bar
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(0, 0, 210, 20, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.text(`Room Detail: ${room.name}`, 14, 13);
        
        doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
        doc.setFontSize(10);
        doc.text(`TYPE: ${room.type.toUpperCase()} ${room.size ? `• SIZE: ${room.size}` : ""}`, 14, 30);

        const tableData = room.boards.flatMap((board: any) => 
          board.components.map((comp: any) => [
            board.board_number,
            board.wall_position || "-",
            (COMPONENT_TYPES.find(t => t.id === comp.type)?.label || comp.type).toUpperCase(),
            comp.count
          ])
        );

        if (tableData.length > 0) {
          autoTable(doc, {
            startY: 35,
            head: [["Board #", "Wall", "Component", "Count"]],
            body: tableData,
            theme: "striped",
            headStyles: { fillColor: primaryColor },
            margin: { top: 35 },
          });
        } else {
          doc.setFontSize(12);
          doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
          doc.text("No electrical boards mapped for this room.", 14, 45);
        }
      });

      // Footer for all pages (except cover)
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 2; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: "center" });
        doc.text(`${building_name} • ${floor_name}`, 14, 285);
      }

      const fileName = `${building_name}_${floor_name}_Report.pdf`.replace(/\s+/g, "_");
      doc.save(fileName);
    } catch (err) {
      console.error("Report error:", err);
      alert("Failed to generate report");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="Rooms" backTo="#" actions={
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={generateFloorReport} isLoading={isLoading}>
            <FileText className="w-4 h-4" /> PDF
          </Button>
          <Button size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4" /> Add Room
          </Button>
        </div>
      } />
      
      <main className="p-4 grid grid-cols-2 gap-3">
        {isLoading ? (
          <div className="col-span-2 flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
        ) : rooms.length === 0 ? (
          <div className="col-span-2 text-center py-20 text-slate-500">
            <DoorOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No rooms added yet.</p>
          </div>
        ) : (
          rooms.map(r => (
            <div key={r.id} className="relative group">
              <Link to={`/rooms/${r.id}`}>
                <Card className="h-full flex flex-col items-center justify-center text-center py-6 pr-2">
                  <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-3">
                    <DoorOpen className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm">{r.name}</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">{r.type}</p>
                </Card>
              </Link>
              <div className="absolute right-2 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    setEditingRoom(r);
                    setNewRoom({ name: r.name, type: r.type, size: r.size || "" });
                  }}
                  className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 hover:border-indigo-200 shadow-sm"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete(r.id);
                  }}
                  className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-red-600 hover:border-red-200 shadow-sm"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </main>

      <AnimatePresence>
        {(isAdding || editingRoom) && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900">{editingRoom ? "Edit Room" : "Add Room"}</h2>
                <button onClick={() => { setIsAdding(false); setEditingRoom(null); setNewRoom({ name: "", type: "Bedroom", size: "" }); }} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={editingRoom ? handleUpdate : handleAdd} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Room Name</label>
                  <input 
                    autoFocus
                    type="text" 
                    value={newRoom.name} 
                    onChange={e => setNewRoom({ ...newRoom, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Master Bedroom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Room Type</label>
                  <select 
                    value={newRoom.type} 
                    onChange={e => setNewRoom({ ...newRoom, type: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option>Bedroom</option>
                    <option>Kitchen</option>
                    <option>Living Room</option>
                    <option>Office</option>
                    <option>Bathroom</option>
                    <option>Balcony</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Size (Optional)</label>
                  <input 
                    type="text" 
                    value={newRoom.size} 
                    onChange={e => setNewRoom({ ...newRoom, size: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. 12x15 ft"
                  />
                </div>
                <Button type="submit" className="w-full" size="lg">{editingRoom ? "Update Room" : "Add Room"}</Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const RoomDetail = () => {
  const { roomId } = useParams();
  const [boards, setBoards] = useState<any[]>([]);
  const [room, setRoom] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingBoard, setEditingBoard] = useState<any>(null);
  const [isAIActive, setIsAIActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [newBoard, setNewBoard] = useState<any>({
    board_number: "",
    wall_position: "North",
    height: "",
    components: []
  });

  useEffect(() => {
    fetch(`/api/rooms/${roomId}/boards`)
      .then(res => res.json())
      .then(data => {
        setBoards(data);
        setIsLoading(false);
      });
  }, [roomId]);

  const handleAddBoard = async () => {
    if (!newBoard.board_number) return;
    const res = await fetch(`/api/rooms/${roomId}/boards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBoard)
    });
    const data = await res.json();
    setBoards([...boards, { id: data.id, ...newBoard }]);
    setNewBoard({ board_number: "", wall_position: "North", height: "", components: [] });
    setIsAdding(false);
  };

  const handleUpdateBoard = async () => {
    if (!newBoard.board_number || !editingBoard) return;
    await fetch(`/api/boards/${editingBoard.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBoard)
    });
    setBoards(boards.map(b => b.id === editingBoard.id ? { ...b, ...newBoard } : b));
    setNewBoard({ board_number: "", wall_position: "North", height: "", components: [] });
    setEditingBoard(null);
    setIsAdding(false);
  };

  const deleteBoard = async (id: number) => {
    if (!confirm("Are you sure you want to delete this board?")) return;
    await fetch(`/api/boards/${id}`, { method: "DELETE" });
    setBoards(boards.filter(b => b.id !== id));
  };

  const startCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Camera API is not supported in this browser or context.");
      return;
    }
    setIsAIActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error("Camera error:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        alert("Camera permission denied. Please allow camera access in your browser settings and ensure you are using HTTPS.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        alert("No camera found on this device.");
      } else {
        alert(`Camera error: ${err.message || "Unknown error"}`);
      }
      setIsAIActive(false);
    }
  };

  const captureAndDetect = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsDetecting(true);

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const formData = new FormData();
      formData.append("image", blob, "board.jpg");

      try {
        const res = await fetch("/api/detect-components", {
          method: "POST",
          body: formData
        });
        const data = await res.json();
        
        if (data.components) {
          setNewBoard({
            ...newBoard,
            board_number: `B${boards.length + 1}`,
            components: data.components
          });
          setIsAIActive(false);
          setIsAdding(true);
          // Stop camera
          const stream = video.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
        }
      } catch (err) {
        console.error("Detection error:", err);
        alert("AI detection failed. Please try manual entry.");
      } finally {
        setIsDetecting(false);
      }
    }, "image/jpeg");
  };

  const generateReport = () => {
    const doc = new jsPDF();
    const primaryColor: [number, number, number] = [79, 70, 229]; // Indigo-600
    const darkColor: [number, number, number] = [15, 23, 42]; // Slate-900
    const secondaryColor: [number, number, number] = [100, 116, 139]; // Slate-500

    // Header
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 40, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("Electrical Room Report", 14, 20);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`${room?.name || "Room Details"} • ${new Date().toLocaleDateString()}`, 14, 30);

    // Room Info
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFontSize(14);
    doc.text("Room Information", 14, 55);
    
    doc.setFontSize(10);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text(`Type: ${room?.type || "N/A"}`, 14, 65);
    doc.text(`Size: ${room?.size || "N/A"}`, 14, 72);
    doc.text(`Total Boards: ${boards.length}`, 14, 79);

    // Component Summary for the Room
    const roomComponents: Record<string, number> = {};
    boards.forEach(b => {
      b.components.forEach((c: any) => {
        const label = COMPONENT_TYPES.find(t => t.id === c.type)?.label || c.type;
        roomComponents[label] = (roomComponents[label] || 0) + c.count;
      });
    });

    const summaryData = Object.entries(roomComponents)
      .sort((a, b) => b[1] - a[1])
      .map(([label, count]) => [label, count]);

    if (summaryData.length > 0) {
      autoTable(doc, {
        startY: 85,
        head: [["Component Type", "Quantity"]],
        body: summaryData,
        theme: "striped",
        headStyles: { fillColor: secondaryColor },
        margin: { right: 110 }, // Put it on the left half
      });
    }

    // Detailed Board Table
    doc.setFontSize(14);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text("Board Breakdown", 14, (doc as any).lastAutoTable?.finalY + 20 || 100);

    const tableData = boards.flatMap(board => 
      board.components.map((comp: any) => [
        board.board_number,
        board.wall_position || "-",
        (COMPONENT_TYPES.find(t => t.id === comp.type)?.label || comp.type).toUpperCase(),
        comp.count
      ])
    );

    autoTable(doc, {
      startY: (doc as any).lastAutoTable?.finalY + 25 || 110,
      head: [["Board #", "Wall", "Component", "Count"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: primaryColor },
    });

    doc.setFontSize(8);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text("Generated by VoltMap AI Professional", 105, 285, { align: "center" });

    doc.save(`VoltMap_${room?.name || "Room"}_Report.pdf`);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Header title="Room Details" backTo="#" actions={
        <Button size="sm" variant="outline" onClick={generateReport}><FileText className="w-4 h-4" /> PDF</Button>
      } />

      <main className="p-4 space-y-4">
        <div className="flex gap-3">
          <Button className="flex-1" onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4" /> Manual Add
          </Button>
          <Button variant="secondary" className="flex-1" onClick={startCamera}>
            <Camera className="w-4 h-4" /> AI Scan
          </Button>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
          ) : boards.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              <LayoutGrid className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No boards mapped in this room.</p>
            </div>
          ) : (
            boards.map(b => (
              <Card key={b.id} className="relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Board {b.board_number}</h3>
                    <p className="text-xs text-slate-500">{b.wall_position} Wall • {b.height || "Standard"} Height</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => {
                        setEditingBoard(b);
                        setNewBoard({
                          board_number: b.board_number,
                          wall_position: b.wall_position || "North",
                          height: b.height || "",
                          components: [...b.components]
                        });
                        setIsAdding(true);
                      }}
                      className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteBoard(b.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {b.components.map((comp: any, idx: number) => {
                    const typeInfo = COMPONENT_TYPES.find(t => t.id === comp.type);
                    const TypeIcon = typeInfo?.icon || Power;
                    return (
                      <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <TypeIcon className="w-4 h-4 text-indigo-600" />
                        <span className="text-[10px] font-medium text-slate-700 truncate">{typeInfo?.label || comp.type}</span>
                        <span className="ml-auto bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[10px] font-bold">{comp.count}</span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))
          )}
        </div>
      </main>

      {/* Manual Add/Edit Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900">{editingBoard ? "Edit Board" : "Add Board"}</h2>
                <button onClick={() => { setIsAdding(false); setEditingBoard(null); setNewBoard({ board_number: "", wall_position: "North", height: "", components: [] }); }} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Board #</label>
                    <input 
                      type="text" 
                      value={newBoard.board_number} 
                      onChange={e => setNewBoard({ ...newBoard, board_number: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g. B1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Wall</label>
                    <select 
                      value={newBoard.wall_position} 
                      onChange={e => setNewBoard({ ...newBoard, wall_position: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      <option>North</option>
                      <option>South</option>
                      <option>East</option>
                      <option>West</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-medium text-slate-500 uppercase">Components</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="Search..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="text-[10px] px-2 py-1 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 w-24"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 max-h-[250px] overflow-y-auto p-1 border border-slate-100 rounded-xl">
                    {COMPONENT_TYPES.filter(t => t.label.toLowerCase().includes(searchTerm.toLowerCase())).map(type => {
                      const existing = newBoard.components.find((c: any) => c.type === type.id);
                      return (
                        <div key={type.id} className={cn(
                          "flex items-center justify-between p-2 rounded-xl border transition-all",
                          existing ? "bg-indigo-50 border-indigo-200" : "bg-white border-slate-200"
                        )}>
                          <div className="flex items-center gap-2 overflow-hidden">
                            <type.icon className={cn("w-4 h-4 flex-shrink-0", existing ? "text-indigo-600" : "text-slate-400")} />
                            <span className="text-[10px] font-medium truncate">{type.label}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {existing && (
                              <button 
                                onClick={() => {
                                  const count = existing.count - 1;
                                  if (count <= 0) {
                                    setNewBoard({ ...newBoard, components: newBoard.components.filter((c: any) => c.type !== type.id) });
                                  } else {
                                    setNewBoard({ ...newBoard, components: newBoard.components.map((c: any) => c.type === type.id ? { ...c, count } : c) });
                                  }
                                }}
                                className="w-5 h-5 flex items-center justify-center bg-white border border-indigo-200 rounded-md text-indigo-600"
                              >-</button>
                            )}
                            {existing && <span className="text-[10px] font-bold w-3 text-center">{existing.count}</span>}
                            <button 
                              onClick={() => {
                                if (existing) {
                                  setNewBoard({ ...newBoard, components: newBoard.components.map((c: any) => c.type === type.id ? { ...c, count: c.count + 1 } : c) });
                                } else {
                                  setNewBoard({ ...newBoard, components: [...newBoard.components, { type: type.id, count: 1 }] });
                                }
                              }}
                              className={cn(
                                "w-5 h-5 flex items-center justify-center rounded-md text-white",
                                existing ? "bg-indigo-600" : "bg-slate-200 text-slate-600"
                              )}
                            >
                              {existing ? "+" : "+"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Button onClick={editingBoard ? handleUpdateBoard : handleAddBoard} className="w-full" size="lg">
                  {editingBoard ? "Update Board" : "Save Board"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Scanner Modal */}
      <AnimatePresence>
        {isAIActive && (
          <div className="fixed inset-0 z-[60] bg-black flex flex-col">
            <div className="relative flex-1">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Overlay */}
              <div className="absolute inset-0 border-[40px] border-black/40 flex items-center justify-center pointer-events-none">
                <div className="w-full max-w-[280px] aspect-square border-2 border-white/50 rounded-3xl relative overflow-hidden">
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-indigo-500 rounded-tl-lg" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-indigo-500 rounded-tr-lg" />
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-indigo-500 rounded-bl-lg" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-indigo-500 rounded-br-lg" />
                  
                  {isDetecting && (
                    <motion.div 
                      initial={{ y: "-100%" }}
                      animate={{ y: "100%" }}
                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      className="absolute inset-x-0 h-1 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)] z-10"
                    />
                  )}
                </div>
              </div>

              <button 
                onClick={() => {
                  setIsAIActive(false);
                  const stream = videoRef.current?.srcObject as MediaStream;
                  stream?.getTracks().forEach(t => t.stop());
                }}
                className="absolute top-6 right-6 p-3 bg-white/10 backdrop-blur-md rounded-full text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-slate-900 p-8 flex flex-col items-center gap-6 relative">
              {isDetecting && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
                >
                  <div className="relative mb-8">
                    <div className="w-24 h-24 border-4 border-indigo-500/20 rounded-full animate-ping absolute inset-0" />
                    <div className="w-24 h-24 border-4 border-indigo-500 rounded-full flex items-center justify-center">
                      <Cpu className="w-10 h-10 text-indigo-500 animate-pulse" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">AI is Analyzing</h3>
                  <p className="text-slate-400 text-sm max-w-[200px]">
                    Detecting switches, sockets, and components...
                  </p>
                  <div className="mt-8 w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                      className="w-1/2 h-full bg-indigo-500"
                    />
                  </div>
                </motion.div>
              )}
              
              <p className="text-white/60 text-sm text-center">Align the electrical board within the frame</p>
              <button 
                onClick={captureAndDetect}
                disabled={isDetecting}
                className="w-20 h-20 bg-white rounded-full flex items-center justify-center active:scale-90 transition-transform disabled:opacity-50"
              >
                <div className="w-16 h-16 border-4 border-slate-900 rounded-full" />
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Main App ---

export default function App() {
  return (
    <Router>
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl relative overflow-x-hidden">
        <Routes>
          <Route path="/" element={<StartScreen />} />
          <Route path="/buildings" element={<BuildingList />} />
          <Route path="/buildings/:buildingId" element={<FloorList />} />
          <Route path="/floors/:floorId" element={<RoomList />} />
          <Route path="/rooms/:roomId" element={<RoomDetail />} />
        </Routes>
      </div>
    </Router>
  );
}
