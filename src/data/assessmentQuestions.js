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
    prompt: "The class below keeps the raw bytes private and only shows IsBusy. Which OOP principle is this?",
    code: `public class StatusFrame
{
    private readonly byte[] _raw;

    public StatusFrame(byte[] raw) => _raw = raw;

    public bool IsBusy => (_raw[3] & 0x04) != 0;
}`,
    options: ["Inheritance", "Encapsulation", "Polymorphism", "Abstraction"],
    answer: 1,
    explanation:
      "Encapsulation hides internal data (the byte array and bit positions) and exposes a safe, named property. If the protocol changes the bit position, only this class changes.",
    sayIt:
      "I hide raw protocol bytes behind named properties, so the rest of the code never depends on byte or bit positions.",
  },
  {
    id: "oop-2",
    topic: "oop",
    kind: "output",
    prompt: "What will this code print?",
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
      "Name() is virtual and overridden, so the call is resolved at runtime by the real object type (Oht). This is runtime polymorphism, even when called from inside the base class.",
    sayIt:
      "With virtual and override, the method that runs depends on the object's real type, not the variable's type.",
  },
  {
    id: "oop-3",
    topic: "oop",
    kind: "output",
    prompt: "Here Oht uses 'new' instead of 'override'. What will this print?",
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
      "'new' hides the base method instead of overriding it. The call is chosen at compile time by the variable type (Robot), so it prints Robot. This is method hiding, and it's usually a sign of a design mistake.",
    sayIt:
      "'new' only hides a method; it isn't polymorphism, so I use virtual and override when behaviour should change per type.",
  },
  {
    id: "oop-4",
    topic: "oop",
    kind: "bug",
    prompt: "Any other class can clear or replace the carrier's history. Which line causes this?",
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
      "A public field lets callers do carrier.History.Clear() or even replace the list. Keep the list private and expose IReadOnlyList, so the only way to change history is MoveTo().",
    sayIt:
      "I keep collections private and expose read-only views, so state only changes through methods that enforce the rules.",
  },

  // ---------- Interfaces, abstract classes & SOLID ----------
  {
    id: "design-1",
    topic: "design",
    kind: "choice",
    prompt: "Which of these is true about interfaces and abstract classes?",
    options: [
      "A class can inherit from many abstract classes",
      "A class can implement many interfaces but inherit only one class",
      "Interfaces can have constructors",
      "Abstract classes cannot contain implemented methods",
    ],
    answer: 1,
    explanation:
      "C# has single class inheritance but multiple interface implementation. Use an abstract class to share code and state between closely related types; use an interface to define a contract any type can sign up to.",
    sayIt:
      "I use an interface for a contract like ICommand, and an abstract base class when related types share real code.",
  },
  {
    id: "design-2",
    topic: "design",
    kind: "choice",
    prompt: "Which line will give a compile error?",
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
      "You can't create an instance of an abstract class. You can hold a derived object in a variable of the abstract type, which is exactly how abstraction is used.",
    sayIt:
      "An abstract class is a partial template: it can't be created directly, only through a concrete subclass.",
  },
  {
    id: "design-3",
    topic: "design",
    kind: "bug",
    prompt: "Someone added a new ResetCommand. When the app sends it, the app crashes. Which line is the problem?",
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
      "Unknown commands silently return null, and the caller crashes later with a NullReferenceException. The deeper problem is the type check chain: every new command means editing this method (Open/Closed violation). An ICommand interface lets each command encode itself.",
    sayIt:
      "Instead of type-checking with if/else, I give every command the same interface so new commands need no changes to the sender.",
  },
  {
    id: "design-4",
    topic: "design",
    kind: "choice",
    prompt: "The screens get a robot controller from a factory and only use the IRobotController interface. Why is this useful?",
    options: [
      "It makes the code run faster",
      "Screens depend on interfaces, so new robot types are added in one place without touching the screens",
      "It removes the need for unit tests",
      "It lets one class inherit from many robots",
    ],
    answer: 1,
    explanation:
      "This is the Factory pattern plus Dependency Inversion: high-level code depends on abstractions. Adding a new robot means a new class and one line in the factory. It also makes testing easy, since you can pass a fake controller.",
    sayIt:
      "The factory hides which concrete controller is created, so adding a robot type doesn't ripple through the UI.",
  },

  // ---------- State machines ----------
  {
    id: "state-1",
    topic: "state",
    kind: "bug",
    prompt: "A transfer jumped from Queued straight to Completed without ever moving. Which line allows this?",
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
      "A state machine must guard its transitions. Without the check, Queued can jump straight to Completed. Each transition method should verify the current state first.",
    sayIt:
      "Every transition checks the current state first, so illegal jumps like Queued to Completed are rejected and logged.",
  },
  {
    id: "state-2",
    topic: "state",
    kind: "output",
    prompt: "What will this code print?",
    code: `enum VehicleState { Idle, Moving, Error }

class Vehicle
{
    public VehicleState State;
}

Console.WriteLine(new Vehicle().State);`,
    options: ["null", "Idle", "0", "Compile error"],
    answer: 1,
    explanation:
      "An enum field defaults to the value 0, which is the first member, Idle. Printing an enum prints its name. Tip: many teams put Unknown = 0 first, so an uninitialised state is never mistaken for a real one.",
    sayIt:
      "Enums default to zero, so I make the zero value something safe like Unknown.",
  },
  {
    id: "state-3",
    topic: "state",
    kind: "choice",
    prompt: "Why use one State enum for a vehicle instead of several true/false flags like isMoving and isError?",
    options: [
      "Booleans use more memory",
      "One enum makes impossible combinations (moving AND charging) unrepresentable and transitions explicit",
      "Enums are faster to compare",
      "Booleans can't be serialized",
    ],
    answer: 1,
    explanation:
      "With n booleans you get 2^n combinations, many of them invalid. A single state value plus defined transitions keeps the object in exactly one valid state and makes the flow easy to draw and test.",
    sayIt:
      "A state machine keeps the object in exactly one valid state and makes every allowed transition explicit.",
  },
  {
    id: "state-4",
    topic: "state",
    kind: "bug",
    prompt: "This switch statement does not compile. Which line causes the error?",
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
      "C# forbids implicit fall-through between non-empty cases (error CS0163). Each section must end with break, return, throw or goto case. This prevents accidental fall-through bugs common in C and C++.",
    sayIt:
      "C# doesn't allow silent fall-through in switch, so every case ends with break, return or throw.",
  },

  // ---------- async / await ----------
  {
    id: "async-1",
    topic: "async",
    kind: "bug",
    prompt: "When the user clicks Connect, the app freezes and never recovers. Which line causes this?",
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
      ".Result blocks the UI thread. ConnectAsync tries to resume on the UI thread after its await, but that thread is blocked waiting for it: a deadlock. Use await all the way up. async void is acceptable only for event handlers.",
    sayIt:
      "Blocking on .Result or .Wait() on the UI thread can deadlock, so I use async and await all the way up.",
  },
  {
    id: "async-2",
    topic: "async",
    kind: "output",
    prompt: "In what order will the letters be printed?",
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
      "An async method runs synchronously until its first await that isn't already complete. So B prints immediately, then WorkAsync returns a Task, Main prints C, then awaits until D is printed, then E.",
    sayIt:
      "An async method runs synchronously up to the first real await, then returns a Task to the caller.",
  },
  {
    id: "async-3",
    topic: "async",
    kind: "bug",
    prompt: "Database errors are never logged, and sometimes the app crashes. Which line is the root cause?",
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
      "async void can't be awaited, so the try/catch finishes before the save does. An exception inside it escapes to the synchronization context and can crash the process. Return Task and await it.",
    sayIt:
      "I return Task from async methods so callers can await them and catch their exceptions; async void is only for event handlers.",
  },
  {
    id: "async-4",
    topic: "async",
    kind: "choice",
    prompt: "You need the status of 5 machines, and each call takes about 1 second. Which code gets all 5 in about 1 second instead of 5?",
    options: [
      "foreach (var id in ids) results.Add(await GetStatusAsync(id));",
      "var results = await Task.WhenAll(ids.Select(GetStatusAsync));",
      "foreach (var id in ids) results.Add(GetStatusAsync(id).Result);",
      "Parallel.ForEach(ids, id => results.Add(GetStatusAsync(id).Result));",
    ],
    answer: 1,
    explanation:
      "Task.WhenAll starts all calls first and then waits for all of them together. Awaiting inside a loop runs them one after another. The Parallel.ForEach version blocks thread-pool threads and also adds to a List from many threads, which isn't thread-safe.",
    sayIt:
      "For independent I/O calls I start them all and await Task.WhenAll, so total time is the slowest call, not the sum.",
  },

  // ---------- Threads & locks ----------
  {
    id: "threads-1",
    topic: "threads",
    kind: "bug",
    prompt: "Many threads call OnTransferDone at the same time. After 10,000 transfers the counter only shows 9,962. Which line is the bug?",
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
      "++ is read, add, write: three steps. Two threads can read the same value and both write the same result, losing an increment (a race condition). Interlocked.Increment does it atomically; a lock also works.",
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
      "Dictionary isn't thread-safe; concurrent writes can corrupt it or throw. ConcurrentDictionary handles locking internally and offers atomic helpers like AddOrUpdate and GetOrAdd.",
    sayIt:
      "For shared maps across threads I use ConcurrentDictionary with AddOrUpdate instead of a plain Dictionary.",
  },
  {
    id: "threads-3",
    topic: "threads",
    kind: "bug",
    prompt: "This method should send only one frame at a time, but it does not compile. Which line is the problem?",
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
      "You can't await inside a lock (error CS1996), because the code after await may resume on a different thread, and a Monitor lock must be released by the same thread. SemaphoreSlim(1, 1) is the async-friendly mutex.",
    sayIt:
      "For mutual exclusion around async code I use SemaphoreSlim with WaitAsync and release it in finally.",
  },
  {
    id: "threads-4",
    topic: "threads",
    kind: "choice",
    prompt: "Thread 1 calls MoveJob while thread 2 calls CancelJob. Sometimes the app hangs forever. Why?",
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
      "Classic deadlock. Thread 1 holds vehicleLock and waits for jobLock; thread 2 holds jobLock and waits for vehicleLock. Fix it with a consistent lock order everywhere, or a single lock, or Monitor.TryEnter with a timeout.",
    sayIt:
      "To avoid deadlocks I always acquire locks in the same order and keep locked sections small.",
  },

  // ---------- Bytes, bits & TCP ----------
  {
    id: "bytes-1",
    topic: "bytes",
    kind: "output",
    prompt: "In this status byte, bit 2 means Busy and bit 1 means Alarm. What will this print?",
    code: `byte status = 0b0000_0101;

bool busy  = (status & 0x04) != 0;
bool alarm = (status & 0x02) != 0;

Console.WriteLine($"{busy} {alarm}");`,
    options: ["True True", "True False", "False True", "False False"],
    answer: 1,
    explanation:
      "0b0101 has bits 0 and 2 set. 0x04 is bit 2, so Busy is True. 0x02 is bit 1, which is 0, so Alarm is False.",
    sayIt:
      "I read status flags with a bitmask: AND with the bit's mask and check it's not zero.",
  },
  {
    id: "bytes-2",
    topic: "bytes",
    kind: "output",
    prompt: "On a normal Windows PC, what will this print?",
    code: `byte[] b = BitConverter.GetBytes((ushort)0x1234);
Console.WriteLine($"{b[0]:X2} {b[1]:X2}");`,
    options: ["12 34", "34 12", "00 12", "Depends on the time of day"],
    answer: 1,
    explanation:
      "x86/x64 is little-endian: the low byte comes first. Many network and equipment protocols use big-endian (network byte order), so sending these bytes directly gives the wrong number. Use BinaryPrimitives.WriteUInt16BigEndian for an explicit order.",
    sayIt:
      "BitConverter uses the machine's endianness, so for protocols I use BinaryPrimitives to set big- or little-endian explicitly.",
  },
  {
    id: "bytes-3",
    topic: "bytes",
    kind: "bug",
    prompt: "Every status message is exactly 16 bytes, but under heavy load the parsing sometimes fails. Which line is the bug?",
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
      "ReadAsync returns how many bytes it actually read, which can be fewer than requested. TCP is a stream, so a 16-byte frame can arrive in pieces. Ignoring the return value parses a half-filled buffer. A return of 0 means the peer closed the connection.",
    sayIt:
      "TCP is a byte stream, so I always check how many bytes ReadAsync returned and loop until the full frame arrives.",
  },
  {
    id: "bytes-4",
    topic: "bytes",
    kind: "choice",
    prompt: "The machine sends messages of different lengths over TCP. How does the receiver know where one message ends?",
    options: [
      "Each ReadAsync call returns exactly one message",
      "Use framing: a length prefix in the header, or start/end delimiter bytes",
      "Wait 100 ms between reads",
      "Switch to UDP so messages never split",
    ],
    answer: 1,
    explanation:
      "TCP has no message boundaries; it can merge or split sends. Protocols add framing, for example HSMS (SECS/GEM over TCP) starts every message with a 4-byte length. Read the header, then read exactly that many bytes.",
    sayIt:
      "Since TCP has no message boundaries, the protocol uses a length header; I read the length first, then exactly that many bytes.",
  },

  // ---------- IDisposable & using ----------
  {
    id: "dispose-1",
    topic: "dispose",
    kind: "bug",
    prompt: "After a few hours, database calls start timing out with \"max pool size was reached\". Which line is the root cause?",
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
      "The connection is never closed, so it's never returned to the pool. Each call leaks one until the pool (default 100) is empty and new requests time out. 'using' guarantees Dispose, even if an exception is thrown.",
    sayIt:
      "I wrap connections in using, so they always go back to the pool, even when an exception happens.",
  },
  {
    id: "dispose-2",
    topic: "dispose",
    kind: "output",
    prompt: "What will this print, in order?",
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
      "Nested usings dispose in reverse order (last opened, first closed), like a stack. That matters when B depends on A, for example a command that uses a connection.",
    sayIt:
      "Resources are disposed in reverse order of creation, so dependents close before what they depend on.",
  },
  {
    id: "dispose-3",
    topic: "dispose",
    kind: "choice",
    prompt: "What does a using statement turn into when the code is compiled?",
    options: [
      "A call to GC.Collect()",
      "A try/finally that calls Dispose() in the finally block",
      "A destructor (finalizer)",
      "A catch block that swallows exceptions",
    ],
    answer: 1,
    explanation:
      "using is syntax sugar for try { ... } finally { obj?.Dispose(); }. It doesn't free managed memory (that's the GC's job); it releases unmanaged resources like sockets, file handles and DB connections deterministically.",
    sayIt:
      "using becomes a try/finally that calls Dispose, so unmanaged resources are released at a known point.",
  },
  {
    id: "dispose-4",
    topic: "dispose",
    kind: "bug",
    prompt: "When the server checks machine status very often, it runs out of network sockets. Which line causes this?",
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
      "HttpClient is meant to be reused. Creating and disposing one per call leaves sockets in TIME_WAIT, and under load you run out. Reuse one instance, or use IHttpClientFactory, which also handles DNS changes. Dispose isn't always the right answer.",
    sayIt:
      "HttpClient should be reused, so I inject it through IHttpClientFactory instead of creating one per request.",
  },

  // ---------- Events & delegates ----------
  {
    id: "events-1",
    topic: "events",
    kind: "bug",
    prompt: "Every time the alarm panel is closed and opened again, memory grows and alarms show up twice. Which line is the bug?",
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
      "The long-lived AlarmService keeps a reference to every panel through its event, so closed panels are never garbage collected and still receive alarms. Unsubscribe in Dispose (in Blazor, implement IDisposable on the component).",
    sayIt:
      "When a short-lived object subscribes to a long-lived event, I unsubscribe in Dispose to avoid memory leaks.",
  },
  {
    id: "events-2",
    topic: "events",
    kind: "bug",
    prompt: "The app crashes with a NullReferenceException when nothing is listening to the event. Which line is the bug?",
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
      "An event with no subscribers is null. ?.Invoke checks and calls in one step, which is also thread-safe against someone unsubscribing between the check and the call.",
    sayIt:
      "I raise events with ?.Invoke, because an event with no subscribers is null.",
  },
  {
    id: "events-3",
    topic: "events",
    kind: "output",
    prompt: "What will this print?",
    code: `Func<int> f = () => 1;
f += () => 2;
f += () => 3;

Console.WriteLine(f());`,
    options: ["1", "3", "6", "Compile error"],
    answer: 1,
    explanation:
      "A multicast delegate calls every method in order, but only the last return value is kept. That's why events usually return void, and why you'd use GetInvocationList() if you need every result.",
    sayIt:
      "A multicast delegate runs every handler but only returns the last result, so events are usually void.",
  },
  {
    id: "events-4",
    topic: "events",
    kind: "choice",
    prompt: "What is the difference between these two lines?",
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
      "With a public field, any class can write OnAlarmField = null (wiping every subscriber) or fire it. The event keyword encapsulates the delegate: only the owning class can raise it.",
    sayIt:
      "The event keyword encapsulates a delegate, so only the owner can raise it and others can only subscribe or unsubscribe.",
  },

  // ---------- LINQ & EF Core ----------
  {
    id: "linq-1",
    topic: "linq",
    kind: "output",
    prompt: "What will this print?",
    code: `var list = new List<int> { 1, 2, 3 };
var big = list.Where(x => x > 1);

list.Add(4);

Console.WriteLine(big.Count());`,
    options: ["2", "3", "4", "Throws InvalidOperationException"],
    answer: 1,
    explanation:
      "LINQ queries are deferred: Where doesn't run until you enumerate it. By the time Count() runs, 4 has been added, so the matches are 2, 3 and 4. Call ToList() if you need a snapshot.",
    sayIt:
      "LINQ is deferred until enumerated, so I call ToList when I need a snapshot at a specific moment.",
  },
  {
    id: "linq-2",
    topic: "linq",
    kind: "bug",
    prompt: "The alarm history page gets slower every week as more alarms are saved. Which line loads too much data?",
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
      "The first ToList() pulls the whole table into memory; sorting and paging then happen in C#. Keep the query as IQueryable until the end, so EF Core turns OrderBy/Skip/Take into SQL and the database returns only one page.",
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
      "One query for vehicles plus one per vehicle: the N+1 problem. It's invisible with 3 rows in testing and slow in production. Use one grouped query instead, for example _db.Jobs.GroupBy(j => j.VehicleId).Select(g => new { g.Key, Count = g.Count() }), or a projection with Include.",
    sayIt:
      "I watch for N+1 queries in loops and replace them with one grouped or joined query.",
  },
  {
    id: "linq-4",
    topic: "linq",
    kind: "output",
    prompt: "What will this print?",
    code: `var ids = new List<int> { 5, 7 };
var x = ids.FirstOrDefault(i => i > 10);

Console.WriteLine(x);`,
    options: ["null", "0", "Throws InvalidOperationException", "5"],
    answer: 1,
    explanation:
      "FirstOrDefault returns default(T) when nothing matches. For int that's 0, not null, which is dangerous if 0 could be a real id. First() would throw instead. Use int? or check Any() when 0 is meaningful.",
    sayIt:
      "FirstOrDefault returns default(T), which is 0 for int, so I'm careful when 0 is a valid value.",
  },

  // ---------- Exceptions & null ----------
  {
    id: "errors-1",
    topic: "errors",
    kind: "bug",
    prompt: "Sometimes the port fails to open, but nobody ever finds out why. Which line is the problem?",
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
      "An empty catch swallows the error: there's no log, and the poller starts on a closed port, causing confusing failures later. Catch the specific exception you expect, log it with context, and either recover properly or rethrow.",
    sayIt:
      "I never swallow exceptions silently; I catch specific types, log with context, and rethrow if I can't recover.",
  },
  {
    id: "errors-2",
    topic: "errors",
    kind: "bug",
    prompt: "The error log always points to this method, never to where the error really happened. Which line causes this?",
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
      "'throw ex;' rethrows as if the exception started here, resetting the stack trace. 'throw;' keeps the original trace. Also log the whole exception, not just the message, so the trace and inner exceptions are kept.",
    sayIt:
      "I use 'throw;' rather than 'throw ex;' so the original stack trace is kept for debugging.",
  },
  {
    id: "errors-3",
    topic: "errors",
    kind: "output",
    prompt: "What will this print?",
    code: `string? name = null;

Console.WriteLine(name?.Length ?? -1);`,
    options: ["0", "-1", "null", "Throws NullReferenceException"],
    answer: 1,
    explanation:
      "?. returns null instead of throwing when name is null, so name?.Length is an int? equal to null. ?? then supplies the fallback -1.",
    sayIt:
      "I use ?. to avoid NullReferenceException and ?? to give a sensible default.",
  },
  {
    id: "errors-4",
    topic: "errors",
    kind: "output",
    prompt: "What will this print?",
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
      "finally always runs before the method actually returns, even after a return statement. That's why cleanup like closing a connection belongs in finally (or in using).",
    sayIt:
      "finally always runs, even after return or an exception, which is why cleanup goes there.",
  },
];
