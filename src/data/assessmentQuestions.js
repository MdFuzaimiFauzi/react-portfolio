// C# / OOP pop quiz question bank for /assessment.
// All snippets are original examples inspired by factory-automation concepts.

export const TOPICS = {
  oop: "OOP pillars",
  design: "Interfaces, abstract classes & SOLID",
  state: "State machines",
  async: "async / await",
  threads: "Threads & locks",
  bytes: "Bytes, bits & TCP",
  dispose: "IDisposable & using",
  events: "Events & delegates",
  linq: "LINQ & EF Core",
  errors: "Exceptions & null",
};

/*
 * Question shapes:
 * - kind "choice" | "output": { options: string[], answer: index, code? }
 * - kind "bug": { code, bugLine (1-based), fixedCode }
 * Every question also has id, topic, prompt, explanation and sayIt
 * (one sentence to say out loud in the interview).
 */
export const QUESTIONS = [
  // ---------- OOP pillars ----------
  {
    id: "oop-1",
    topic: "oop",
    kind: "choice",
    prompt: "The StatusFrame class keeps its byte array private. Other code can only read IsBusy. Which OOP principle is this?",
    code: `public class StatusFrame
{
    private readonly byte[] _raw;

    public StatusFrame(byte[] raw) => _raw = raw;

    public bool IsBusy => (_raw[3] & 0x04) != 0;
}`,
    options: ["Inheritance", "Encapsulation", "Polymorphism", "Abstraction"],
    answer: 1,
    explanation:
      "This is encapsulation. Encapsulation means hiding data inside a class and only showing what other code needs. Here the raw bytes are private, and the class gives a clear property called IsBusy. Tip: If the bit position ever changes, you only fix this one class.",
    sayIt:
      "I hide raw protocol bytes behind named properties, so the rest of the code never depends on byte or bit positions.",
  },
  {
    id: "oop-2",
    topic: "oop",
    kind: "output",
    prompt: "What is the output of the following code?",
    code: `class Robot
{
    public virtual string Name() => "Robot";
    public string Describe() => "I am " + Name();
}

class Oht : Robot
{
    public override string Name() => "OHT";
}

Robot r = new Oht();
Console.WriteLine(r.Describe());`,
    options: ["I am Robot", "I am OHT", "Compile error", "I am "],
    answer: 1,
    explanation:
      "The output is \"I am OHT\". Name() is marked virtual in Robot and override in Oht. When a method is virtual, C# checks the real object type when the program runs. The object is an Oht, so Oht's Name() runs, even though the variable type is Robot. This is called polymorphism.",
    sayIt:
      "With virtual and override, the method that runs depends on the object's real type, not the variable's type.",
  },
  {
    id: "oop-3",
    topic: "oop",
    kind: "output",
    prompt: "This time Oht uses new instead of override. What is the output?",
    code: `class Robot
{
    public string Name() => "Robot";
}

class Oht : Robot
{
    public new string Name() => "OHT";
}

Robot r = new Oht();
Console.WriteLine(r.Name());`,
    options: ["OHT", "Robot", "Compile error", "Runtime exception"],
    answer: 1,
    explanation:
      "The output is \"Robot\". The new keyword hides the base method. It does not override it. So C# picks the method from the variable type, which is Robot. Tip: If you want each class to have its own behaviour, use virtual and override, not new.",
    sayIt:
      "'new' only hides a method; it isn't polymorphism, so I use virtual and override when behaviour should change per type.",
  },
  {
    id: "oop-4",
    topic: "oop",
    kind: "bug",
    prompt: "Any class can clear or replace the carrier's History list. Find the line that causes this.",
    code: `public class Carrier
{
    public List<string> History = new List<string>();
    public string Location { get; private set; } = "";

    public void MoveTo(string port)
    {
        Location = port;
        History.Add(port);
    }
}`,
    bugLine: 3,
    fixedCode: `public class Carrier
{
    private readonly List<string> _history = new();
    public IReadOnlyList<string> History => _history;
    public string Location { get; private set; } = "";

    public void MoveTo(string port)
    {
        Location = port;
        _history.Add(port);
    }
}`,
    explanation:
      "Line 3 is the problem. History is a public field, so any code can write carrier.History.Clear() or even set it to a new list. Make the list private and share it as an IReadOnlyList. Then the only way to add history is through MoveTo().",
    sayIt:
      "I keep collections private and expose read-only views, so state only changes through methods that enforce the rules.",
  },

  // ---------- Interfaces, abstract classes & SOLID ----------
  {
    id: "design-1",
    topic: "design",
    kind: "choice",
    prompt: "Which statement about interfaces and abstract classes is true?",
    options: [
      "A class can inherit from many abstract classes",
      "A class can implement many interfaces but inherit only one class",
      "Interfaces can have constructors",
      "Abstract classes cannot contain implemented methods",
    ],
    answer: 1,
    explanation:
      "A class can implement many interfaces, but it can only inherit from one class. Use an interface when you want a contract that many classes can follow, like ICommand. Use an abstract class when related classes should share real code.",
    sayIt:
      "I use an interface for a contract like ICommand, and an abstract base class when related types share real code.",
  },
  {
    id: "design-2",
    topic: "design",
    kind: "choice",
    prompt: "Which line of code will NOT compile?",
    code: `abstract class Controller
{
    public abstract void Connect();
    public void Log(string m) => Console.WriteLine(m);
}

class AgvController : Controller
{
    public override void Connect() => Log("AGV up");
}`,
    options: [
      "Controller c = new AgvController();",
      "var c = new Controller();",
      "AgvController c = new AgvController();",
      "new AgvController().Log(\"hi\");",
    ],
    answer: 1,
    explanation:
      "You cannot create an object from an abstract class, so new Controller() gives a compile error. An abstract class is like an unfinished template. You can only create objects from a class that inherits from it, like AgvController.",
    sayIt:
      "An abstract class is a partial template: it can't be created directly, only through a concrete subclass.",
  },
  {
    id: "design-3",
    topic: "design",
    kind: "bug",
    prompt: "A developer added a new ResetCommand. Now the app crashes when it sends this command. Find the line that causes the crash.",
    code: `public byte[] Encode(object cmd)
{
    if (cmd is MoveCommand m) return m.ToBytes();
    if (cmd is StopCommand s) return s.ToBytes();
    return null;
}`,
    bugLine: 5,
    fixedCode: `public interface ICommand
{
    byte[] ToBytes();
}

public byte[] Encode(ICommand cmd) => cmd.ToBytes();`,
    explanation:
      "Line 5 returns null for any command it does not know, so the caller crashes later with a NullReferenceException. The bigger problem is the list of if statements: every new command means changing this method. Give every command the same ICommand interface, and let each command turn itself into bytes.",
    sayIt:
      "Instead of type-checking with if/else, I give every command the same interface so new commands need no changes to the sender.",
  },
  {
    id: "design-4",
    topic: "design",
    kind: "choice",
    prompt: "The screens get their robot controller from a factory and only use the IRobotController interface. What is the main benefit?",
    options: [
      "It makes the code run faster",
      "Screens depend on interfaces, so new robot types are added in one place without touching the screens",
      "It removes the need for unit tests",
      "It lets one class inherit from many robots",
    ],
    answer: 1,
    explanation:
      "The screens do not need to know which robot class they are using. To add a new robot type, you write one new class and add one line to the factory. The screens do not change. This also makes testing easier, because you can pass in a fake controller.",
    sayIt:
      "The factory hides which concrete controller is created, so adding a robot type doesn't ripple through the UI.",
  },

  // ---------- State machines ----------
  {
    id: "state-1",
    topic: "state",
    kind: "bug",
    prompt: "A transfer went from Queued straight to Completed, without ever moving. Find the line that allows this.",
    code: `public enum TransferState { Queued, Transferring, Completed, Cancelled }

public class TransferCommand
{
    public TransferState State { get; private set; }

    public void Complete()
    {
        State = TransferState.Completed;
    }
}`,
    bugLine: 9,
    fixedCode: `public enum TransferState { Queued, Transferring, Completed, Cancelled }

public class TransferCommand
{
    public TransferState State { get; private set; }

    public void Complete()
    {
        if (State != TransferState.Transferring)
            throw new InvalidOperationException(
                $"Cannot complete from {State}");
        State = TransferState.Completed;
    }
}`,
    explanation:
      "Line 9 sets the state to Completed without checking the current state. A state machine should only allow valid moves. Check that the transfer is Transferring first, and throw an error if it is not.",
    sayIt:
      "Every transition checks the current state first, so illegal jumps like Queued to Completed are rejected and logged.",
  },
  {
    id: "state-2",
    topic: "state",
    kind: "output",
    prompt: "What is the output of the following code?",
    code: `enum VehicleState { Idle, Moving, Error }

class Vehicle
{
    public VehicleState State;
}

Console.WriteLine(new Vehicle().State);`,
    options: ["null", "Idle", "0", "Compile error"],
    answer: 1,
    explanation:
      "The output is \"Idle\". A new enum field starts at the value 0, and 0 is the first item in the list, which is Idle. When you print an enum, C# prints its name. Tip: Many teams put Unknown = 0 first, so a state that was never set is easy to spot.",
    sayIt:
      "Enums default to zero, so I make the zero value something safe like Unknown.",
  },
  {
    id: "state-3",
    topic: "state",
    kind: "choice",
    prompt: "Why use one State enum for a vehicle, instead of separate true/false flags like isMoving and isError?",
    options: [
      "Booleans use more memory",
      "One enum makes impossible combinations (moving AND charging) unrepresentable and transitions explicit",
      "Enums are faster to compare",
      "Booleans can't be serialized",
    ],
    answer: 1,
    explanation:
      "With separate flags, a vehicle could be moving and charging at the same time, which makes no sense. One State value means the vehicle is always in exactly one state. It also makes every allowed change clear and easy to test.",
    sayIt:
      "A state machine keeps the object in exactly one valid state and makes every allowed transition explicit.",
  },
  {
    id: "state-4",
    topic: "state",
    kind: "bug",
    prompt: "This switch statement does not compile. Find the line that causes the error.",
    code: `switch (state)
{
    case VehicleState.Idle:
        StartMove();
    case VehicleState.Moving:
        UpdatePosition();
        break;
}`,
    bugLine: 4,
    fixedCode: `switch (state)
{
    case VehicleState.Idle:
        StartMove();
        break;
    case VehicleState.Moving:
        UpdatePosition();
        break;
}`,
    explanation:
      "In C#, a case cannot fall through into the next case. Every case must end with break, return or throw. Line 4 calls StartMove() and then runs straight into the next case, so the compiler stops with an error. Add break after line 4.",
    sayIt:
      "C# doesn't allow silent fall-through in switch, so every case ends with break, return or throw.",
  },

  // ---------- async / await ----------
  {
    id: "async-1",
    topic: "async",
    kind: "bug",
    prompt: "When the user clicks Connect, the app freezes and never recovers. Find the line that causes this.",
    code: `private void BtnConnect_Click(object sender, EventArgs e)
{
    var ok = ConnectAsync().Result;
    lblStatus.Text = ok ? "Connected" : "Failed";
}`,
    bugLine: 3,
    fixedCode: `private async void BtnConnect_Click(object sender, EventArgs e)
{
    var ok = await ConnectAsync();
    lblStatus.Text = ok ? "Connected" : "Failed";
}`,
    explanation:
      "Line 3 uses .Result, which blocks the UI thread while it waits. But ConnectAsync needs that same UI thread to finish its work. Each one waits for the other forever. This is a deadlock. Use await instead of .Result. Note: async void is fine for event handlers like this button click.",
    sayIt:
      "Blocking on .Result or .Wait() on the UI thread can deadlock, so I use async and await all the way up.",
  },
  {
    id: "async-2",
    topic: "async",
    kind: "output",
    prompt: "In what order are the letters printed?",
    code: `static async Task Main()
{
    Console.WriteLine("A");
    var t = WorkAsync();
    Console.WriteLine("C");
    await t;
    Console.WriteLine("E");
}

static async Task WorkAsync()
{
    Console.WriteLine("B");
    await Task.Delay(100);
    Console.WriteLine("D");
}`,
    options: ["A B C D E", "A C B D E", "A B D C E", "A C E B D"],
    answer: 0,
    explanation:
      "The order is A, B, C, D, E. An async method runs normally until it reaches its first await. So WorkAsync prints B right away, then waits for the delay. Main prints C, then waits for the task. When the delay ends, D prints, then E.",
    sayIt:
      "An async method runs synchronously up to the first real await, then returns a Task to the caller.",
  },
  {
    id: "async-3",
    topic: "async",
    kind: "bug",
    prompt: "Database errors are never logged, and sometimes the app crashes. Find the line that causes this.",
    code: `public async void SaveAlarmAsync(Alarm alarm)
{
    _db.Alarms.Add(alarm);
    await _db.SaveChangesAsync();
}

// caller
try { SaveAlarmAsync(alarm); }
catch (Exception ex) { _log.Error(ex); }`,
    bugLine: 1,
    fixedCode: `public async Task SaveAlarmAsync(Alarm alarm)
{
    _db.Alarms.Add(alarm);
    await _db.SaveChangesAsync();
}

// caller
try { await SaveAlarmAsync(alarm); }
catch (Exception ex) { _log.Error(ex); }`,
    explanation:
      "Line 1 uses async void. The caller cannot await an async void method, so the try/catch finishes before the save is done. If the save fails, the error is not caught and can crash the app. Return a Task instead, and await it.",
    sayIt:
      "I return Task from async methods so callers can await them and catch their exceptions; async void is only for event handlers.",
  },
  {
    id: "async-4",
    topic: "async",
    kind: "choice",
    prompt: "You need the status of 5 machines. Each call takes about 1 second. Which code gets all 5 results in about 1 second?",
    options: [
      "foreach (var id in ids) results.Add(await GetStatusAsync(id));",
      "var results = await Task.WhenAll(ids.Select(GetStatusAsync));",
      "foreach (var id in ids) results.Add(GetStatusAsync(id).Result);",
      "Parallel.ForEach(ids, id => results.Add(GetStatusAsync(id).Result));",
    ],
    answer: 1,
    explanation:
      "Task.WhenAll starts all 5 calls at once, then waits for all of them together. So the total time is about 1 second. Using await inside a loop runs the calls one after another, so it takes about 5 seconds.",
    sayIt:
      "For independent I/O calls I start them all and await Task.WhenAll, so total time is the slowest call, not the sum.",
  },

  // ---------- Threads & locks ----------
  {
    id: "threads-1",
    topic: "threads",
    kind: "bug",
    prompt: "Many threads call OnTransferDone at the same time. After 10,000 transfers, the counter shows only 9,962. Find the bug.",
    code: `public class Stats
{
    private int _completed;

    public void OnTransferDone()
    {
        _completed++;
    }

    public int Completed => _completed;
}`,
    bugLine: 7,
    fixedCode: `public class Stats
{
    private int _completed;

    public void OnTransferDone()
    {
        Interlocked.Increment(ref _completed);
    }

    public int Completed => Volatile.Read(ref _completed);
}`,
    explanation:
      "_completed++ looks like one step, but it is really three: read, add 1, write. Two threads can read the same value at the same time, and one update gets lost. This is called a race condition. Interlocked.Increment does all three steps safely in one go.",
    sayIt:
      "count++ isn't atomic, so with many threads I use Interlocked or a lock to avoid lost updates.",
  },
  {
    id: "threads-2",
    topic: "threads",
    kind: "choice",
    prompt: "Several threads read and update the same dictionary of vehicle positions. What is the simplest safe choice?",
    options: [
      "Dictionary<string, int> with no lock",
      "ConcurrentDictionary<string, int>",
      "List<KeyValuePair<string, int>>",
      "Mark the Dictionary field as static",
    ],
    answer: 1,
    explanation:
      "A normal Dictionary is not safe when many threads change it at the same time. It can break or throw errors. ConcurrentDictionary is built for this, and it has safe helpers like AddOrUpdate.",
    sayIt:
      "For shared maps across threads I use ConcurrentDictionary with AddOrUpdate instead of a plain Dictionary.",
  },
  {
    id: "threads-3",
    topic: "threads",
    kind: "bug",
    prompt: "This method should send only one frame at a time, but it does not compile. Find the line that causes the error.",
    code: `private readonly object _sync = new();

public async Task SendAsync(byte[] frame)
{
    lock (_sync)
    {
        await _stream.WriteAsync(frame);
    }
}`,
    bugLine: 7,
    fixedCode: `private readonly SemaphoreSlim _gate = new(1, 1);

public async Task SendAsync(byte[] frame)
{
    await _gate.WaitAsync();
    try
    {
        await _stream.WriteAsync(frame);
    }
    finally
    {
        _gate.Release();
    }
}`,
    explanation:
      "You cannot use await inside a lock block. After an await, the code may continue on a different thread, but a lock must be released by the same thread that took it. Use SemaphoreSlim(1, 1) instead, which works with await.",
    sayIt:
      "For mutual exclusion around async code I use SemaphoreSlim with WaitAsync and release it in finally.",
  },
  {
    id: "threads-4",
    topic: "threads",
    kind: "choice",
    prompt: "Thread 1 runs MoveJob while thread 2 runs CancelJob. Sometimes the app hangs forever. Why?",
    code: `void MoveJob()
{
    lock (_vehicleLock)
    lock (_jobLock)
    { /* ... */ }
}

void CancelJob()
{
    lock (_jobLock)
    lock (_vehicleLock)
    { /* ... */ }
}`,
    options: [
      "lock is too slow",
      "Deadlock: each thread holds one lock and waits forever for the other; always take locks in the same order",
      "The locks should be static",
      "A race condition on the job fields",
    ],
    answer: 1,
    explanation:
      "This is a deadlock. Thread 1 locks the vehicle, then waits for the job. Thread 2 locks the job, then waits for the vehicle. Neither can continue. Tip: Always take locks in the same order everywhere, and the deadlock cannot happen.",
    sayIt:
      "To avoid deadlocks I always acquire locks in the same order and keep locked sections small.",
  },

  // ---------- Bytes, bits & TCP ----------
  {
    id: "bytes-1",
    topic: "bytes",
    kind: "output",
    prompt: "In this status byte, bit 2 means Busy and bit 1 means Alarm. What is the output?",
    code: `byte status = 0b0000_0101;

bool busy  = (status & 0x04) != 0;
bool alarm = (status & 0x02) != 0;

Console.WriteLine($"{busy} {alarm}");`,
    options: ["True True", "True False", "False True", "False False"],
    answer: 1,
    explanation:
      "The output is \"True False\". The byte 0b0000_0101 has bit 0 and bit 2 turned on. 0x04 checks bit 2, which is on, so busy is True. 0x02 checks bit 1, which is off, so alarm is False.",
    sayIt:
      "I read status flags with a bitmask: AND with the bit's mask and check it's not zero.",
  },
  {
    id: "bytes-2",
    topic: "bytes",
    kind: "output",
    prompt: "On a normal Windows PC, what is the output of this code?",
    code: `byte[] b = BitConverter.GetBytes((ushort)0x1234);
Console.WriteLine($"{b[0]:X2} {b[1]:X2}");`,
    options: ["12 34", "34 12", "00 12", "Depends on the time of day"],
    answer: 1,
    explanation:
      "The output is \"34 12\". Windows PCs store numbers little-endian, which means the smallest byte comes first. Many machines and network protocols expect big-endian, where the biggest byte comes first. Tip: Use BinaryPrimitives.WriteUInt16BigEndian to choose the byte order yourself.",
    sayIt:
      "BitConverter uses the machine's endianness, so for protocols I use BinaryPrimitives to set big- or little-endian explicitly.",
  },
  {
    id: "bytes-3",
    topic: "bytes",
    kind: "bug",
    prompt: "Every status message is exactly 16 bytes long, but sometimes parsing fails when the network is busy. Find the bug.",
    code: `var buffer = new byte[16];
await stream.ReadAsync(buffer, 0, 16);
var frame = StatusFrame.Parse(buffer);`,
    bugLine: 2,
    fixedCode: `var buffer = new byte[16];
await stream.ReadExactlyAsync(buffer, 0, 16); // .NET 7+

// Older .NET: loop until all bytes arrive
// int read = 0;
// while (read < 16)
// {
//     int n = await stream.ReadAsync(buffer, read, 16 - read);
//     if (n == 0) throw new IOException("Connection closed");
//     read += n;
// }
var frame = StatusFrame.Parse(buffer);`,
    explanation:
      "ReadAsync does not always fill the whole buffer. It returns how many bytes it actually read, and that can be less than 16. TCP is a stream, so one message can arrive in pieces. Keep reading until you have all 16 bytes, or use ReadExactlyAsync in .NET 7 and later.",
    sayIt:
      "TCP is a byte stream, so I always check how many bytes ReadAsync returned and loop until the full frame arrives.",
  },
  {
    id: "bytes-4",
    topic: "bytes",
    kind: "choice",
    prompt: "A machine sends messages of different lengths over TCP. How does the receiver know where each message ends?",
    options: [
      "Each ReadAsync call returns exactly one message",
      "Use framing: a length prefix in the header, or start/end delimiter bytes",
      "Wait 100 ms between reads",
      "Switch to UDP so messages never split",
    ],
    answer: 1,
    explanation:
      "TCP does not keep message boundaries. It can join two messages together or split one into parts. So the protocol adds framing, usually a length at the start of each message. For example, HSMS (SECS/GEM over TCP) starts every message with a 4-byte length. Read the length first, then read exactly that many bytes.",
    sayIt:
      "Since TCP has no message boundaries, the protocol uses a length header; I read the length first, then exactly that many bytes.",
  },

  // ---------- IDisposable & using ----------
  {
    id: "dispose-1",
    topic: "dispose",
    kind: "bug",
    prompt: "After a few hours, database calls start to fail with \"max pool size was reached\". Find the line that causes this.",
    code: `public int CountAlarms()
{
    var conn = new SqlConnection(_connectionString);
    conn.Open();
    var cmd = new SqlCommand("SELECT COUNT(*) FROM Alarms", conn);
    return (int)cmd.ExecuteScalar();
}`,
    bugLine: 3,
    fixedCode: `public int CountAlarms()
{
    using var conn = new SqlConnection(_connectionString);
    conn.Open();
    using var cmd = new SqlCommand("SELECT COUNT(*) FROM Alarms", conn);
    return (int)cmd.ExecuteScalar();
}`,
    explanation:
      "The connection on line 3 is never closed, so it never goes back to the connection pool. Each call uses up one more connection until none are left. Put using in front of it. Then the connection always closes, even if an error happens.",
    sayIt:
      "I wrap connections in using, so they always go back to the pool, even when an exception happens.",
  },
  {
    id: "dispose-2",
    topic: "dispose",
    kind: "output",
    prompt: "What is the output of the following code, in order?",
    code: `class Res : IDisposable
{
    private readonly string _n;
    public Res(string n) { _n = n; Console.WriteLine("open " + _n); }
    public void Dispose() => Console.WriteLine("close " + _n);
}

using (var a = new Res("A"))
using (var b = new Res("B"))
{
    Console.WriteLine("work");
}`,
    options: [
      "open A, open B, work, close A, close B",
      "open A, open B, work, close B, close A",
      "open A, work, close A, open B, close B",
      "open B, open A, work, close A, close B",
    ],
    answer: 1,
    explanation:
      "The objects close in the reverse order they were opened, like a stack of plates. A opens first and B opens second, so B closes first. This matters when one object depends on another, like a command that uses a connection.",
    sayIt:
      "Resources are disposed in reverse order of creation, so dependents close before what they depend on.",
  },
  {
    id: "dispose-3",
    topic: "dispose",
    kind: "choice",
    prompt: "What does a using statement become when your code is compiled?",
    options: [
      "A call to GC.Collect()",
      "A try/finally that calls Dispose() in the finally block",
      "A destructor (finalizer)",
      "A catch block that swallows exceptions",
    ],
    answer: 1,
    explanation:
      "A using statement becomes a try/finally block that calls Dispose() in the finally part. So Dispose() always runs, even if an error happens. Note: using does not free memory. It releases things like sockets, files and database connections.",
    sayIt:
      "using becomes a try/finally that calls Dispose, so unmanaged resources are released at a known point.",
  },
  {
    id: "dispose-4",
    topic: "dispose",
    kind: "bug",
    prompt: "When the server checks machine status very often, it runs out of network sockets. Find the line that causes this.",
    code: `public async Task<string> GetStatusAsync(string url)
{
    using var client = new HttpClient();
    return await client.GetStringAsync(url);
}`,
    bugLine: 3,
    fixedCode: `public class StatusClient
{
    private readonly HttpClient _client;

    // Injected by IHttpClientFactory (services.AddHttpClient<StatusClient>())
    public StatusClient(HttpClient client) => _client = client;

    public Task<string> GetStatusAsync(string url) =>
        _client.GetStringAsync(url);
}`,
    explanation:
      "Line 3 creates a new HttpClient for every call. Even after it is disposed, its socket stays open for a short time. When you make many calls, the sockets run out. Create one HttpClient and reuse it, or use IHttpClientFactory. So Dispose is not always the right answer!",
    sayIt:
      "HttpClient should be reused, so I inject it through IHttpClientFactory instead of creating one per request.",
  },

  // ---------- Events & delegates ----------
  {
    id: "events-1",
    topic: "events",
    kind: "bug",
    prompt: "Each time the alarm panel is closed and opened again, memory grows and alarms show up twice. Find the bug.",
    code: `public class AlarmPanel : IDisposable
{
    private readonly AlarmService _svc;

    public AlarmPanel(AlarmService svc)
    {
        _svc = svc;
        _svc.AlarmRaised += OnAlarm;
    }

    private void OnAlarm(object? s, AlarmEventArgs e) => Show(e.Message);

    public void Dispose() { }
}`,
    bugLine: 13,
    fixedCode: `public class AlarmPanel : IDisposable
{
    private readonly AlarmService _svc;

    public AlarmPanel(AlarmService svc)
    {
        _svc = svc;
        _svc.AlarmRaised += OnAlarm;
    }

    private void OnAlarm(object? s, AlarmEventArgs e) => Show(e.Message);

    public void Dispose() => _svc.AlarmRaised -= OnAlarm;
}`,
    explanation:
      "The panel subscribes to AlarmRaised but never unsubscribes. The AlarmService keeps a link to every old panel, so they never get cleaned up, and they still receive alarms. Unsubscribe with -= inside Dispose().",
    sayIt:
      "When a short-lived object subscribes to a long-lived event, I unsubscribe in Dispose to avoid memory leaks.",
  },
  {
    id: "events-2",
    topic: "events",
    kind: "bug",
    prompt: "The app crashes with a NullReferenceException when nothing is listening to the event. Find the bug.",
    code: `public class Vehicle
{
    public event EventHandler<int>? PositionChanged;

    public void Update(int position)
    {
        PositionChanged(this, position);
    }
}`,
    bugLine: 7,
    fixedCode: `public class Vehicle
{
    public event EventHandler<int>? PositionChanged;

    public void Update(int position)
    {
        PositionChanged?.Invoke(this, position);
    }
}`,
    explanation:
      "When no one has subscribed, the event is null. Calling it directly on line 7 then throws an error. Use PositionChanged?.Invoke(this, position). The ?. only calls the event when it is not null.",
    sayIt:
      "I raise events with ?.Invoke, because an event with no subscribers is null.",
  },
  {
    id: "events-3",
    topic: "events",
    kind: "output",
    prompt: "What is the output of the following code?",
    code: `Func<int> f = () => 1;
f += () => 2;
f += () => 3;

Console.WriteLine(f());`,
    options: ["1", "3", "6", "Compile error"],
    answer: 1,
    explanation:
      "The output is 2. All the methods in a delegate run in order, but only the last return value is kept. That is why events usually return void.",
    sayIt:
      "A multicast delegate runs every handler but only returns the last result, so events are usually void.",
  },
  {
    id: "events-4",
    topic: "events",
    kind: "choice",
    prompt: "What does the event keyword add, compared with a public delegate field?",
    code: `public Action<string>? OnAlarmField;      // A
public event Action<string>? OnAlarmEvent; // B`,
    options: [
      "Nothing, they are identical",
      "Outside code can only += and -= an event; it can't invoke it or overwrite it with =",
      "Events run on a background thread",
      "Events can't have more than one subscriber",
    ],
    answer: 1,
    explanation:
      "With a public delegate field, any class can set it to null and remove every subscriber, or call it directly. The event keyword stops that. Other classes can only subscribe with += or unsubscribe with -=. Only the class that owns the event can raise it.",
    sayIt:
      "The event keyword encapsulates a delegate, so only the owner can raise it and others can only subscribe or unsubscribe.",
  },

  // ---------- LINQ & EF Core ----------
  {
    id: "linq-1",
    topic: "linq",
    kind: "output",
    prompt: "What is the output of the following code?",
    code: `var list = new List<int> { 1, 2, 3 };
var big = list.Where(x => x > 1);

list.Add(4);

Console.WriteLine(big.Count());`,
    options: ["2", "3", "4", "Throws InvalidOperationException"],
    answer: 1,
    explanation:
      "The output is 3. A LINQ query does not run when you write it. It runs when you use the result, here at Count(). By then, 4 has been added to the list, so 2, 3 and 4 all match. Tip: Call ToList() if you want to save the result at a certain moment.",
    sayIt:
      "LINQ is deferred until enumerated, so I call ToList when I need a snapshot at a specific moment.",
  },
  {
    id: "linq-2",
    topic: "linq",
    kind: "bug",
    prompt: "The alarm history page gets slower every week as more alarms are saved. Find the line that loads too much data.",
    code: `public List<Alarm> GetPage(int pageIndex, int pageSize)
{
    return _db.Alarms.ToList()
        .OrderByDescending(a => a.RaisedAt)
        .Skip(pageIndex * pageSize)
        .Take(pageSize)
        .ToList();
}`,
    bugLine: 3,
    fixedCode: `public async Task<List<Alarm>> GetPageAsync(int pageIndex, int pageSize)
{
    return await _db.Alarms
        .AsNoTracking()
        .OrderByDescending(a => a.RaisedAt)
        .Skip(pageIndex * pageSize)
        .Take(pageSize)
        .ToListAsync();
}`,
    explanation:
      "The first ToList() on line 3 loads every alarm from the database into memory. Then the sorting and paging happen in C#. Move ToList() to the end, so the database does the sorting and paging and only sends back one page.",
    sayIt:
      "I keep EF queries as IQueryable until the end so filtering and paging run in SQL, not in memory.",
  },
  {
    id: "linq-3",
    topic: "linq",
    kind: "choice",
    prompt: "There are 100 vehicles. How many database queries does this code run?",
    code: `var vehicles = await _db.Vehicles.ToListAsync();

foreach (var v in vehicles)
{
    v.JobCount = await _db.Jobs
        .CountAsync(j => j.VehicleId == v.Id);
}`,
    options: ["1", "2", "101", "200"],
    answer: 2,
    explanation:
      "It runs 101 queries: 1 query to get the vehicles, plus 1 query for each of the 100 vehicles. This is called the N+1 problem. It looks fine with 3 test vehicles but gets slow in real use. Get all the counts in one query instead, for example with GroupBy.",
    sayIt:
      "I watch for N+1 queries in loops and replace them with one grouped or joined query.",
  },
  {
    id: "linq-4",
    topic: "linq",
    kind: "output",
    prompt: "What is the output of the following code?",
    code: `var ids = new List<int> { 5, 7 };
var x = ids.FirstOrDefault(i => i > 10);

Console.WriteLine(x);`,
    options: ["null", "0", "Throws InvalidOperationException", "5"],
    answer: 1,
    explanation:
      "The output is 0. FirstOrDefault returns the default value when nothing matches. For int, the default is 0, not null. Be careful if 0 can also be a real ID. Note: First() would throw an error instead.",
    sayIt:
      "FirstOrDefault returns default(T), which is 0 for int, so I'm careful when 0 is a valid value.",
  },

  // ---------- Exceptions & null ----------
  {
    id: "errors-1",
    topic: "errors",
    kind: "bug",
    prompt: "Sometimes the port fails to open, but nobody ever finds out why. Find the line that causes this.",
    code: `public void Start()
{
    try
    {
        _port.Open();
    }
    catch (Exception)
    {
    }
    _poller.Start();
}`,
    bugLine: 7,
    fixedCode: `public void Start()
{
    try
    {
        _port.Open();
    }
    catch (IOException ex)
    {
        _log.Error(ex, "Failed to open {Port}", _port.PortName);
        throw;
    }
    _poller.Start();
}`,
    explanation:
      "The empty catch block on line 7 hides the error. Nothing is logged, and the code keeps going as if the port were open. Catch the specific error you expect, log it, and then throw it again if you cannot fix it.",
    sayIt:
      "I never swallow exceptions silently; I catch specific types, log with context, and rethrow if I can't recover.",
  },
  {
    id: "errors-2",
    topic: "errors",
    kind: "bug",
    prompt: "The error log always points to this method, never to where the error really happened. Find the line that causes this.",
    code: `try
{
    _robot.Move(target);
}
catch (Exception ex)
{
    _log.Error(ex.Message);
    throw ex;
}`,
    bugLine: 8,
    fixedCode: `try
{
    _robot.Move(target);
}
catch (Exception ex)
{
    _log.Error(ex, "Move failed for {Target}", target);
    throw;
}`,
    explanation:
      "throw ex; restarts the stack trace from this line, so you lose where the error really started. Use throw; on its own instead. It keeps the original stack trace. Also log the whole exception, not just ex.Message.",
    sayIt:
      "I use 'throw;' rather than 'throw ex;' so the original stack trace is kept for debugging.",
  },
  {
    id: "errors-3",
    topic: "errors",
    kind: "output",
    prompt: "What is the output of the following code?",
    code: `string? name = null;

Console.WriteLine(name?.Length ?? -1);`,
    options: ["0", "-1", "null", "Throws NullReferenceException"],
    answer: 1,
    explanation:
      "The output is -1. name is null, so name?.Length gives null instead of throwing an error. Then ?? gives the backup value, -1.",
    sayIt:
      "I use ?. to avoid NullReferenceException and ?? to give a sensible default.",
  },
  {
    id: "errors-4",
    topic: "errors",
    kind: "output",
    prompt: "What is the output of the following code?",
    code: `static int Test()
{
    try
    {
        return 1;
    }
    finally
    {
        Console.Write("F ");
    }
}

Console.WriteLine(Test());`,
    options: ["1", "F 1", "1 F", "Compile error"],
    answer: 1,
    explanation:
      "The output is \"F 1\". The finally block always runs before the method really returns, even after a return statement. That is why clean-up code goes in finally.",
    sayIt:
      "finally always runs, even after return or an exception, which is why cleanup goes there.",
  },
];
