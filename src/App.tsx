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
  Sun
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
  { id: "switch", label: "Switch", icon: ToggleRight },
  { id: "socket", label: "Socket", icon: Plug2 },
  { id: "fan_regulator", label: "Fan Regulator", icon: Fan },
  { id: "ac_switch", label: "AC Switch", icon: Snowflake },
  { id: "smart_button", label: "Smart Button", icon: Cpu },
  { id: "dimmer", label: "Dimmer", icon: Sun },
];

// --- Components ---

const Header = ({ title, backTo, actions }: { title: string; backTo?: string; actions?: React.ReactNode }) => (
  <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between">
    <div className="flex items-center gap-3">
      {backTo && (
        <Link to={backTo} className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
      )}
      <h1 className="text-lg font-semibold text-slate-900 truncate max-w-[200px]">{title}</h1>
    </div>
    <div className="flex items-center gap-2">
      {actions}
    </div>
  </header>
);

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

const BuildingList = () => {
  const [buildings, setBuildings] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
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
            <Link key={b.id} to={`/buildings/${b.id}`}>
              <Card className="flex items-center justify-between mb-3">
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
          ))
        )}
      </main>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900">Add Building</h2>
                <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAdd} className="space-y-4">
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
                <Button type="submit" className="w-full" size="lg">Create Building</Button>
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

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title={building?.name || "Floors"} backTo="/" actions={
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
            <Link key={f.id} to={`/floors/${f.id}`}>
              <Card className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h3 className="font-medium text-slate-900">{f.name}</h3>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300" />
              </Card>
            </Link>
          ))
        )}
      </main>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900">Add Floor</h2>
                <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAdd} className="space-y-4">
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
                <Button type="submit" className="w-full" size="lg">Add Floor</Button>
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

  const generateFloorReport = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/floors/${floorId}/report`);
      const data = await res.json();
      const { building_name, floor_name, rooms } = data;
      
      const doc = new jsPDF();
      
      // Cover Page
      doc.setFontSize(24);
      doc.setTextColor(79, 70, 229); // Indigo-600
      doc.text("Electrical Mapping Report", 14, 40);
      
      doc.setFontSize(14);
      doc.setTextColor(100, 116, 139); // Slate-500
      doc.text(`Building: ${building_name}`, 14, 55);
      doc.text(`Floor: ${floor_name}`, 14, 65);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 75);
      doc.text(`Total Rooms: ${rooms.length}`, 14, 85);

      rooms.forEach((room: any) => {
        doc.addPage();
        
        // Room Header
        doc.setFontSize(18);
        doc.setTextColor(15, 23, 42); // Slate-900
        doc.text(`${room.name}`, 14, 25);
        
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139); // Slate-500
        doc.text(`TYPE: ${room.type.toUpperCase()} ${room.size ? `• SIZE: ${room.size}` : ""}`, 14, 32);

        const tableData = room.boards.flatMap((board: any) => 
          board.components.map((comp: any) => [
            board.board_number,
            board.wall_position || "-",
            comp.type.replace("_", " ").toUpperCase(),
            comp.count
          ])
        );

        if (tableData.length > 0) {
          autoTable(doc, {
            startY: 40,
            head: [["Board #", "Wall", "Component", "Count"]],
            body: tableData,
            theme: "striped",
            headStyles: { fillColor: [79, 70, 229] }, // Indigo-600
            margin: { top: 40 },
          });
        } else {
          doc.setFontSize(12);
          doc.setTextColor(100, 116, 139);
          doc.text("No electrical boards mapped for this room.", 14, 45);
        }
      });

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
      <Header title="Rooms" backTo={`/buildings/1`} actions={
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
            <Link key={r.id} to={`/rooms/${r.id}`}>
              <Card className="h-full flex flex-col items-center justify-center text-center py-6">
                <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-3">
                  <DoorOpen className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-900 text-sm">{r.name}</h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">{r.type}</p>
              </Card>
            </Link>
          ))
        )}
      </main>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900">Add Room</h2>
                <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAdd} className="space-y-4">
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
                <Button type="submit" className="w-full" size="lg">Add Room</Button>
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
  const [isAIActive, setIsAIActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);
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

  const deleteBoard = async (id: number) => {
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
    doc.setFontSize(20);
    doc.text("Electrical Mapping Report", 14, 22);
    doc.setFontSize(12);
    doc.text(`Room: ${room?.name || "Room"}`, 14, 32);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 40);

    const tableData = boards.flatMap(board => 
      board.components.map((comp: any) => [
        board.board_number,
        board.wall_position || "-",
        comp.type.replace("_", " ").toUpperCase(),
        comp.count
      ])
    );

    autoTable(doc, {
      startY: 50,
      head: [["Board #", "Wall", "Component", "Count"]],
      body: tableData,
    });

    doc.save(`VoltMap_Report_${roomId}.pdf`);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Header title="Room Details" backTo={`/floors/1`} actions={
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
              <Card key={b.id} className="relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Board {b.board_number}</h3>
                    <p className="text-xs text-slate-500">{b.wall_position} Wall • {b.height || "Standard"} Height</p>
                  </div>
                  <button onClick={() => deleteBoard(b.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {b.components.map((comp: any, idx: number) => {
                    const TypeIcon = COMPONENT_TYPES.find(t => t.id === comp.type)?.icon || Power;
                    return (
                      <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <TypeIcon className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs font-medium text-slate-700 truncate">{comp.type.replace("_", " ")}</span>
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

      {/* Manual Add Modal */}
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
                <h2 className="text-xl font-bold text-slate-900">Add Board</h2>
                <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
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
                  <label className="block text-xs font-medium text-slate-500 uppercase mb-2">Components</label>
                  <div className="grid grid-cols-2 gap-2">
                    {COMPONENT_TYPES.map(type => {
                      const existing = newBoard.components.find((c: any) => c.type === type.id);
                      return (
                        <div key={type.id} className={cn(
                          "flex items-center justify-between p-2 rounded-xl border transition-all",
                          existing ? "bg-indigo-50 border-indigo-200" : "bg-white border-slate-200"
                        )}>
                          <div className="flex items-center gap-2">
                            <type.icon className={cn("w-4 h-4", existing ? "text-indigo-600" : "text-slate-400")} />
                            <span className="text-xs font-medium">{type.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
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
                            <span className="text-xs font-bold w-4 text-center">{existing?.count || 0}</span>
                            <button 
                              onClick={() => {
                                if (existing) {
                                  setNewBoard({ ...newBoard, components: newBoard.components.map((c: any) => c.type === type.id ? { ...c, count: c.count + 1 } : c) });
                                } else {
                                  setNewBoard({ ...newBoard, components: [...newBoard.components, { type: type.id, count: 1 }] });
                                }
                              }}
                              className="w-5 h-5 flex items-center justify-center bg-indigo-600 rounded-md text-white"
                            >+</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Button onClick={handleAddBoard} className="w-full" size="lg">Save Board</Button>
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
          <Route path="/" element={<BuildingList />} />
          <Route path="/buildings/:buildingId" element={<FloorList />} />
          <Route path="/floors/:floorId" element={<RoomList />} />
          <Route path="/rooms/:roomId" element={<RoomDetail />} />
        </Routes>
      </div>
    </Router>
  );
}
