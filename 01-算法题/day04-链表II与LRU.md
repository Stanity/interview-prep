# Day 4 · 链表 II + LRU（6 题）

> 今日考点：**分段操作**（两两交换、K 个一组）、**复杂链表复制**（哈希 / 原地穿插）、**归并排序**、**哈希 + 双向链表**（LRU）、**多路归并**（堆 / 分治）。
> 每题结构：完整题干 → 示例 → 约束 → 提示阶梯 ×3 → 完整 C++ → 复杂度 → 易错点 → 追问。

| 题号 | 题目 | 难度 | 模板一句话 | 复杂度 |
|---|---|---|---|---|
| 24 | 两两交换链表中的节点 | Medium | 哑结点 + 三指针成对翻转 | O(n) / O(1) |
| 25 | K 个一组翻转链表 | Hard | 先数够 k 个，再局部反转 3 步接回 | O(n) / O(1) |
| 138 | 随机链表的复制 | Medium | 哈希建映射 / 原地穿插后拆链 | O(n) / O(n) 或 O(1) |
| 148 | 排序链表 | Medium | 快慢找中点 + 归并 | O(n log n) / O(log n) |
| 146 | LRU 缓存 | Medium | 哈希 + 双向链表（哨兵） | get/put O(1) |
| 23 | 合并 K 个升序链表 | Hard | 最小堆取表头 / 分治两两合并 | O(n log k) |

---

:::qa LC 24 · 两两交换链表中的节点（Medium｜必刷）

**题目**
给你一个链表，**两两交换**其中相邻的节点，并返回交换后链表的头节点。
你必须在不修改节点内部的值的情况下完成本题（即只能进行节点交换）。

**示例 1**
```
输入：head = [1,2,3,4]
输出：[2,1,4,3]
```

**示例 2**
```
输入：head = []
输出：[]
```

**示例 3**
```
输入：head = [1]
输出：[1]
```

**约束**：节点数目范围 `[0, 100]`；`0 <= Node.val <= 100`

**提示 1（方向）**
每轮处理两个节点，需要一个"前一组的尾"把新的一组接回去 → 哑结点 + `prev` 指针。
循环条件是 `prev->next && prev->next->next`（**至少两个节点才交换**）。

**提示 2（关键不变量）**
设 `a = prev->next`、`b = a->next`。要做的三步顺序是：
① `a->next = b->next`（先让 a 越过 b，保住后半段）② `b->next = a` ③ `prev->next = b`。
顺序错了就丢链。之后 `prev = a`（a 已经是这一组的尾巴）。

**提示 3（伪代码）**
```
dummy.next = head; prev = dummy
while prev->next && prev->next->next:
    a = prev->next; b = a->next
    a->next = b->next; b->next = a; prev->next = b
    prev = a
return dummy.next
```

**完整代码**

```cpp
// LC 24 两两交换链表中的节点
// 哑结点 + 三指针：先越过再反向，最后接回
#include <cstddef>
struct ListNode { int val; ListNode* next; ListNode(int x): val(x), next(nullptr) {} };

ListNode* swapPairs(ListNode* head) {
    ListNode dummy(0);
    dummy.next = head;
    ListNode* prev = &dummy;
    while (prev->next && prev->next->next) {
        ListNode* a = prev->next;
        ListNode* b = a->next;
        a->next = b->next;      // ① a 越过 b（保住后半段）
        b->next = a;            // ② b 指向 a
        prev->next = b;         // ③ 前驱接上 b
        prev = a;               // 下一轮的前驱是本组尾巴 a
    }
    return dummy.next;
}
```

**复杂度**：时间 O(n)，空间 O(1)。

**易错点**
- 三步指针赋值顺序打乱 → 丢链或成环。
- `prev = a` 写成 `prev = b` → 下一轮重复处理。
- 循环条件写成 `prev->next` 单个 → 奇数长度时越界。

**面试追问**
- 递归写法？→ `head->next->next = swapPairs(head->next->next)` 之类，注意返回新头。
- 与 LC 25 的关系？→ 25 是"k 个一组"的推广，24 是 `k == 2` 的特例。
:::

:::qa LC 25 · K 个一组翻转链表（Hard｜必刷）

**题目**
给你链表的头节点 `head`，每 `k` 个节点一组进行翻转，请你返回修改后的链表。
- `k` 是一个正整数，它的值小于或等于链表的长度。
- 如果节点总数不是 `k` 的整数倍，那么请将最后剩余的节点**保持原有顺序**。
- 你不能只是单纯地改变节点内部的值，而是需要实际进行节点交换。

**示例 1**
```
输入：head = [1,2,3,4,5], k = 2
输出：[2,1,4,3,5]
```

**示例 2**
```
输入：head = [1,2,3,4,5], k = 3
输出：[3,2,1,4,5]
```

**示例 3**
```
输入：head = [1,2,3,4,5], k = 1
输出：[1,2,3,4,5]
```

**约束**：节点数为 `n`；`1 <= k <= n <= 5000`；`0 <= Node.val <= 1000`
**进阶**：只使用常数额外空间。

**提示 1（方向）**
分三小步循环：① 从 `groupPrev` 出发数 `k` 步找 `kth`，若不足直接结束；② 反转 `[groupPrev->next, kth]` 这一段；③ 把反转后的段接回去。

**提示 2（关键不变量）**
反转时把 `prev` 初始化为 `groupNext`（下一组的开头），这样反转结束后**原组头节点的 `next` 自动指向 `groupNext`**，省掉一次显式连接。
接回时：`groupPrev->next = 新头`（即原 `kth`），`groupPrev` 更新为**原组头**（现在是本组尾巴）。

**提示 3（伪代码）**
```
dummy.next = head; groupPrev = dummy
loop:
    kth = groupPrev; 走 k 步 → 若中途为空则 break
    groupNext = kth->next
    prev = groupNext; cur = groupPrev->next
    while cur != groupNext: nxt = cur->next; cur->next = prev; prev = cur; cur = nxt
    oldHead = groupPrev->next      // 反转后变尾巴
    groupPrev->next = prev         // prev 是新头（原 kth）
    groupPrev = oldHead
return dummy.next
```

**完整代码**

```cpp
// LC 25 K 个一组翻转链表
// 数够 k 个 → 局部反转（prev 预置为 groupNext）→ 接回
#include <cstddef>
struct ListNode { int val; ListNode* next; ListNode(int x): val(x), next(nullptr) {} };

ListNode* reverseKGroup(ListNode* head, int k) {
    ListNode dummy(0);
    dummy.next = head;
    ListNode* groupPrev = &dummy;

    while (true) {
        // ① 找本组第 k 个节点
        ListNode* kth = groupPrev;
        for (int i = 0; i < k && kth; i++) kth = kth->next;
        if (!kth) break;                     // 不足 k 个，保持原序

        ListNode* groupNext = kth->next;

        // ② 反转 [groupPrev->next, kth]：prev 预置为 groupNext
        ListNode* prev = groupNext;
        ListNode* cur = groupPrev->next;
        while (cur != groupNext) {
            ListNode* nxt = cur->next;
            cur->next = prev;
            prev = cur;
            cur = nxt;
        }

        // ③ 接回：prev 是新头，原组头变成尾巴
        ListNode* oldHead = groupPrev->next;
        groupPrev->next = prev;
        groupPrev = oldHead;
    }
    return dummy.next;
}
```

**复杂度**：时间 O(n)，空间 O(1)。

**易错点**
- 不足 `k` 个时也翻转 → 尾部顺序被打乱。
- `prev = groupNext` 写成 `prev = nullptr` → 还要额外连尾巴，容易漏。
- `groupPrev` 更新成 `prev`（新头）而不是 `oldHead` → 死循环。
- `for (int i = 0; i < k && kth; i++)` 里的 `kth` 判空漏掉 → 越界。

**面试追问**
- 递归写法？→ 先判断够不够 k 个，够则反转前 k 个（递归反转的变体）再递归接上。
- 为什么可以做到 O(1) 空间？→ 只改指针，不建新节点，也不存额外结构。
- 如果要求"不足 k 个也翻转"？→ 把 `if (!kth) break;` 换成用实际剩余长度翻转。
:::

:::qa LC 138 · 随机链表的复制（Medium｜必刷）

**题目**
给你一个长度为 `n` 的链表，每个节点包含一个额外增加的随机指针 `random`，该指针可以指向链表中的**任何节点或空节点**。
构造这个链表的**深拷贝**：新链表由 `n` 个**全新节点**组成，值与原节点相同，`next` 与 `random` 都应指向**复制链表中的新节点**，且结构与原链表一致。复制链表中的指针都不应指向原链表中的节点。

**示例 1**
```
输入：head = [[7,null],[13,0],[11,4],[10,2],[1,0]]
输出：[[7,null],[13,0],[11,4],[10,2],[1,0]]
解释：每个节点写作 [val, random_index]，random_index 为 null 表示 random 指向空
```

**示例 2**
```
输入：head = [[1,1],[2,1]]
输出：[[1,1],[2,1]]
```

**示例 3**
```
输入：head = [[3,null],[3,0],[3,null]]
输出：[[3,null],[3,0],[3,null]]
```

**约束**：`0 <= n <= 1000`；`-10^4 <= Node.val <= 10^4`；`Node.random` 为 `null` 或指向链表中的节点

**提示 1（方向）**
难点在于 `random` 可能指向**尚未创建的节点**。解法一：哈希表存 `原节点 → 新节点`，**两遍扫描**（第一遍只建节点，第二遍连 `next` 和 `random`）。

**提示 2（关键不变量）**
两遍扫描的本质是"先把所有节点都造出来，再建立任意连接"——只要映射齐全，`random` 指向谁都不怕。
进阶 O(1) 空间：把新节点插到原节点**后面**（`A → A' → B → B'`），则 `A'->random = A->random->next`，最后拆成两条链。

**提示 3（伪代码 · 哈希版）**
```
for p in list: mp[p] = new Node(p->val)
for p in list:
    mp[p]->next   = p->next   ? mp[p->next]   : null
    mp[p]->random = p->random ? mp[p->random] : null
return mp[head]
```

**完整代码（哈希版，推荐先写这个）**

```cpp
// LC 138 随机链表的复制（哈希映射，两遍扫描）
#include <unordered_map>
using namespace std;
struct Node {
    int val;
    Node* next;
    Node* random;
    Node(int v) : val(v), next(nullptr), random(nullptr) {}
};

Node* copyRandomList(Node* head) {
    if (!head) return nullptr;
    unordered_map<Node*, Node*> mp;
    for (Node* p = head; p; p = p->next) mp[p] = new Node(p->val);   // ① 只建节点
    for (Node* p = head; p; p = p->next) {                            // ② 再连指针
        mp[p]->next   = p->next   ? mp[p->next]   : nullptr;
        mp[p]->random = p->random ? mp[p->random] : nullptr;
    }
    return mp[head];
}
```

**完整代码（O(1) 额外空间 · 原地穿插）**

```cpp
// LC 138 原地穿插：复制节点插到原节点之后 → 连 random → 拆链
Node* copyRandomList(Node* head) {
    if (!head) return nullptr;

    // ① 每个原节点后面插一个副本
    for (Node* p = head; p; p = p->next->next) {
        Node* copy = new Node(p->val);
        copy->next = p->next;
        p->next = copy;
    }
    // ② 连 random：副本的 random = 原 random 的副本
    for (Node* p = head; p; p = p->next->next)
        if (p->random) p->next->random = p->random->next;
    // ③ 拆成两条链
    Node* newHead = head->next;
    for (Node* p = head; p; ) {
        Node* copy = p->next;
        p->next = copy->next;                                  // 恢复原链
        copy->next = copy->next ? copy->next->next : nullptr;  // 接上副本链
        p = p->next;
    }
    return newHead;
}
```

**复杂度**：哈希版 O(n)/O(n)；原地版 O(n)/O(1)。

**易错点**
- 第一遍就试图连 `next` → 目标节点还没创建。
- `random` 为空没判 → 空指针。
- 原地版拆链时顺序错了，把原链表弄坏（面试官会检查输入是否被污染）。

**面试追问**
- 为什么原地版能省空间？→ 用原链表的 `next` 指针"暂存"映射关系。
- 如果 `random` 可能指向链表外的节点？→ 题目不允许；工程上需要额外校验。
- 深拷贝与浅拷贝的区别，在这里体现为什么？
:::

:::qa LC 148 · 排序链表（Medium｜必刷）

**题目**
给你链表的头结点 `head`，请将其按**升序**排列并返回排序后的链表。
**进阶**：在 O(n log n) 时间复杂度和常数级空间复杂度下完成。

**示例 1**
```
输入：head = [4,2,1,3]
输出：[1,2,3,4]
```

**示例 2**
```
输入：head = [-1,5,3,4,0]
输出：[-1,0,3,4,5]
```

**示例 3**
```
输入：head = []
输出：[]
```

**约束**：节点数目范围 `[0, 5 * 10^4]`；`-10^5 <= Node.val <= 10^5`

**提示 1（方向）**
链表无法随机访问，快排的分区要来回扫描很不友好，**归并排序**最合适（顺序访问 + 稳定）。分割用**快慢指针找中点**，合并复用 LC 21。

**提示 2（关键不变量）**
找中点时 `fast` 初始化为 `head->next`（而不是 `head`），这样 `slow` 会停在**前半段的最后一个节点**，`slow->next` 才是后半段起点；随后**必须切断** `slow->next = nullptr`，否则递归无限循环。

**提示 3（伪代码）**
```
if !head or !head->next: return head
slow = head, fast = head->next
while fast && fast->next: slow = slow->next; fast = fast->next->next
mid = slow->next; slow->next = null
return merge(sortList(head), sortList(mid))
```

**完整代码（自顶向下递归）**

```cpp
// LC 148 排序链表
// 归并排序：快慢指针找中点 + 切断 + 合并
#include <cstddef>
struct ListNode { int val; ListNode* next; ListNode(int x): val(x), next(nullptr) {} };

ListNode* mergeTwo(ListNode* a, ListNode* b) {
    ListNode dummy(0);
    ListNode* t = &dummy;
    while (a && b) {
        if (a->val <= b->val) { t->next = a; a = a->next; }
        else                  { t->next = b; b = b->next; }
        t = t->next;
    }
    t->next = a ? a : b;
    return dummy.next;
}

ListNode* sortList(ListNode* head) {
    if (!head || !head->next) return head;          // 0 或 1 个节点

    ListNode *slow = head, *fast = head->next;      // fast 从第二个开始
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
    }
    ListNode* mid = slow->next;
    slow->next = nullptr;                           // 切断，否则死循环

    return mergeTwo(sortList(head), sortList(mid));
}
```

**复杂度**：时间 O(n log n)，空间 O(log n)（递归栈）。

**易错点**
- `fast = head` 初始化 → 两节点时 `slow` 不动，切出空的一半，死循环。
- 忘记 `slow->next = nullptr` → 递归永不终止。
- 用快排思路在链表上做分区 → 代码复杂且不稳定，面试不推荐。

**面试追问**
- 自底向上归并（O(1) 空间）怎么做？→ 先求长度，`step = 1, 2, 4, ...` 每次按 `step` 切段两两合并。
- 为什么链表比数组更适合归并？→ 合并阶段不需要额外数组，只改指针。
- 稳定性如何保证？→ 合并时用 `<=` 取左段。
:::

:::qa LC 146 · LRU 缓存（Medium｜必刷）

**题目**
请你设计并实现一个满足 **LRU（最近最少使用）缓存**约束的数据结构。实现 `LRUCache` 类：
- `LRUCache(int capacity)`：以正整数 `capacity` 初始化 LRU 缓存
- `int get(int key)`：如果关键字 `key` 存在于缓存中，则返回其值，否则返回 `-1`
- `void put(int key, int value)`：如果 `key` 已存在，则变更其值为 `value`；如果不存在，则插入该组 `key-value`。如果插入导致数量超过 `capacity`，则**逐出最久未使用的关键字**

`get` 和 `put` 必须以 **O(1)** 的平均时间复杂度运行。

**示例 1**
```
输入：
["LRUCache","put","put","get","put","get","put","get","get","get"]
[[2],[1,1],[2,2],[1],[3,3],[2],[4,4],[1],[3],[4]]
输出：
[null,null,null,1,null,-1,null,-1,3,4]

解释：
LRUCache l = new LRUCache(2);
l.put(1,1);   // 缓存 {1=1}
l.put(2,2);   // 缓存 {1=1, 2=2}
l.get(1);     // 返回 1，{2=2, 1=1}（1 变为最近使用）
l.put(3,3);   // 容量满，逐出最久未用的 2 → {1=1, 3=3}
l.get(2);     // 返回 -1（未找到）
l.put(4,4);   // 逐出 1 → {3=3, 4=4}
l.get(1);     // -1
l.get(3);     // 3
l.get(4);     // 4
```

**约束**：`1 <= capacity <= 3000`；`0 <= key <= 10^4`；`0 <= value <= 10^5`；最多调用 `2 * 10^5` 次 `get` 和 `put`

**提示 1（方向）**
O(1) 的 `get` 需要哈希表；O(1) 的"逐出最久未使用"需要能在任意位置 O(1) 删除并保持顺序的结构 → **双向链表**。两者组合：`map<key, 节点指针>` + 链表（头 = 最近使用，尾 = 最久未使用）。

**提示 2（关键不变量）**
用**两个哨兵**（head/tail）把"空链表 / 只有一个节点 / 在头在尾"这些边界全部消掉，`remove` 和 `addFront` 就都不需要判空。
每次 `get` 命中、每次 `put` 更新，都要把节点**移到头部**（标记为最近使用）。

**提示 3（伪代码）**
```
remove(p): p->prev->next = p->next; p->next->prev = p->prev
addFront(p): p->next = head->next; p->prev = head; head->next->prev = p; head->next = p

get(k): 命中 → remove + addFront，返回 val；未命中 → -1
put(k,v): 存在 → 改值 + remove + addFront
          不存在 → 满则删除 tail->prev（并 map.erase），再 new 节点 addFront
```

**完整代码（手写双向链表）**

```cpp
// LC 146 LRU 缓存
// 哈希（key → 节点）+ 双向链表（头=最近使用，尾=最久未使用）+ 两个哨兵
#include <unordered_map>
using namespace std;

struct Node {
    int key, val;
    Node *prev, *next;
    Node(int k = 0, int v = 0) : key(k), val(v), prev(nullptr), next(nullptr) {}
};

class LRUCache {
    int cap;
    unordered_map<int, Node*> mp;
    Node *head, *tail;      // 哨兵：head->next 最近使用，tail->prev 最久未使用

    void remove(Node* p) {
        p->prev->next = p->next;
        p->next->prev = p->prev;
    }
    void addFront(Node* p) {
        p->next = head->next;
        p->prev = head;
        head->next->prev = p;
        head->next = p;
    }

public:
    LRUCache(int capacity) : cap(capacity) {
        head = new Node();
        tail = new Node();
        head->next = tail;
        tail->prev = head;
    }

    int get(int key) {
        auto it = mp.find(key);
        if (it == mp.end()) return -1;
        Node* p = it->second;
        remove(p);
        addFront(p);           // 命中后升级为最近使用
        return p->val;
    }

    void put(int key, int value) {
        auto it = mp.find(key);
        if (it != mp.end()) {  // 已存在：更新并前移
            Node* p = it->second;
            p->val = value;
            remove(p);
            addFront(p);
            return;
        }
        if ((int)mp.size() == cap) {         // 容量满：逐出最久未使用
            Node* lru = tail->prev;
            remove(lru);
            mp.erase(lru->key);              // key 必须存在节点里，否则无法 erase
            delete lru;
        }
        Node* p = new Node(key, value);
        addFront(p);
        mp[key] = p;
    }
};
```

**复杂度**：`get` / `put` 均 O(1) 平均；空间 O(capacity)。

**易错点**
- 节点里**不存 key** → 逐出时无法从 `map` 里删（必须存 key，这是最容易漏的点）。
- `remove` 后忘记 `addFront`（`get` 命中没更新顺序）。
- 没有哨兵 → 空链表/单节点时到处判空，写错率高。
- `cap == 1` 的边界。

**面试追问**
- 用 `std::list` + `unordered_map` 怎么写？→ `list<pair<int,int>>` + `map<int, list<...>::iterator>`，`splice` 到头部。
- **LFU** 怎么做？→ `key → (val, freq)` + `freq → 双向链表`，再加 `minFreq` 变量，O(1)。
- 多线程安全？→ 加 `mutex` 或用分片（sharded cache）降低锁竞争。
- 真实系统里 LRU 的问题？→ 扫描型访问会污染缓存（可用 LRU-K / ARC / TinyLFU 缓解）。
:::

:::qa LC 23 · 合并 K 个升序链表（Hard｜必刷）

**题目**
给你一个链表数组，每个链表都已经按**升序**排列。请你将所有链表合并到一个升序链表中，返回合并后的链表。

**示例 1**
```
输入：lists = [[1,4,5],[1,3,4],[2,6]]
输出：[1,1,2,3,4,4,5,6]
解释：多个链表数组按如下方式合并：
[1->4->5, 1->3->4, 2->6] → 1->1->2->3->4->4->5->6
```

**示例 2**
```
输入：lists = []
输出：[]
```

**示例 3**
```
输入：lists = [[]]
输出：[]
```

**约束**：`k == lists.length`；`0 <= k <= 10^4`；`0 <= lists[i].length <= 500`；`-10^4 <= lists[i][j] <= 10^4`；总节点数不超过 `10^4`

**提示 1（方向）**
每次要从 k 个链表头里取最小 → **最小堆**。堆里只放各链表当前的头节点，取出后把它的 `next` 再压进去。

**提示 2（关键不变量）**
堆大小恒为 O(k)，每个节点进出堆各一次 → 时间 O(n log k)。对比"顺序两两合并到第一个"是 O(nk)（n 相同、k 大时明显变慢）。

**提示 3（伪代码）**
```
pq = min-heap（按 val）
for p in lists: if p: pq.push(p)
dummy, tail = dummy
while pq not empty:
    p = pq.top(); pq.pop()
    tail->next = p; tail = tail->next
    if p->next: pq.push(p->next)
tail->next = null
return dummy.next
```

**完整代码（最小堆）**

```cpp
// LC 23 合并 K 个升序链表
// 最小堆维护 k 个链表头：O(n log k)
#include <vector>
#include <queue>
#include <cstddef>
using namespace std;
struct ListNode { int val; ListNode* next; ListNode(int x): val(x), next(nullptr) {} };

struct Cmp {
    // 注意：返回 a->val > b->val 得到小根堆
    bool operator()(const ListNode* a, const ListNode* b) const { return a->val > b->val; }
};

ListNode* mergeKLists(vector<ListNode*>& lists) {
    priority_queue<ListNode*, vector<ListNode*>, Cmp> pq;
    for (ListNode* p : lists) if (p) pq.push(p);     // 空链表要跳过

    ListNode dummy(0);
    ListNode* tail = &dummy;
    while (!pq.empty()) {
        ListNode* p = pq.top(); pq.pop();
        tail->next = p;
        tail = tail->next;
        if (p->next) pq.push(p->next);
    }
    tail->next = nullptr;
    return dummy.next;
}
```

**完整代码（分治两两合并，也可作为备选）**

```cpp
// LC 23 分治法：两两合并，共 log k 轮
ListNode* mergeTwo(ListNode* a, ListNode* b) {
    ListNode dummy(0); ListNode* t = &dummy;
    while (a && b) {
        if (a->val <= b->val) { t->next = a; a = a->next; }
        else                  { t->next = b; b = b->next; }
        t = t->next;
    }
    t->next = a ? a : b;
    return dummy.next;
}
ListNode* merge(vector<ListNode*>& lists, int l, int r) {
    if (l > r) return nullptr;
    if (l == r) return lists[l];
    int m = l + (r - l) / 2;
    return mergeTwo(merge(lists, l, m), merge(lists, m + 1, r));
}
ListNode* mergeKLists(vector<ListNode*>& lists) {
    if (lists.empty()) return nullptr;
    return merge(lists, 0, (int)lists.size() - 1);
}
```

**复杂度**：堆 O(n log k) / O(k)；分治 O(n log k) / O(log k) 栈空间。

**易错点**
- 忘记跳过空链表 → 堆里塞 `nullptr` 崩。
- `Cmp` 写成 `a->val < b->val` → 变成大根堆，结果逆序。
- 忘记 `tail->next = nullptr`（最后一个节点的 next 可能还指着旧链）。

**面试追问**
- 为什么堆是 O(n log k) 而不是 O(n log n)？→ 堆里只有 k 个元素。
- k 很大（比如 10^4）而每个链表很短时，哪种更好？→ 分治（避免大堆的常数开销）。
- 如果要求**流式**（链表可能无限长）？→ 只能用堆，分治不适用。
:::

---

## 今日复盘三问

1. 24 和 25 的关系？（25 是 k 个一组的推广，24 是 `k == 2` 的特例；两者都用哑结点 + 分段接回）
2. LRU 为什么**必须**在节点里存 key？（逐出时要从 `map` 中 `erase(key)`，而 `map` 是 key→节点，不是节点→key）
3. 138 的 O(1) 空间版本，本质用了什么技巧？（把"映射关系"临时存进原链表的结构里）
