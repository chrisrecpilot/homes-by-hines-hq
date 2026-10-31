import { describe, expect, it } from "vitest";
import { calculateEstimate, concreteVolume, floorArea, masonryUnits, multiplyMoney, paintLitres, sheetCount, totals, wallArea } from "./calculate";
import { type CatalogEntry, type ProjectSpec } from "./types";

const spec = (category: ProjectSpec["category"], length = 5, width = 4): ProjectSpec => ({ category, length, width, height: 2.4, storeys: 1, location: "Maidstone", openingArea: 2, foundationDepth: null, foundationWidth: null, roof: "flat", bifolds: false, underfloorHeating: false, structuralOpening: false, description: "A measured project", assumptions: [], exclusions: [] });
describe("Approved estimating rules", () => {
  it("adds 12% markup to £9,000, making £10,080 before VAT", () => expect(totals(900000,12,0)).toEqual({ base:900000,markup:108000,subtotal:1008000,vat:0,total:1008000 }));
  it("rejects markup below 10%", () => expect(() => totals(10000,9,0)).toThrow());
  it("rejects markup above 15%", () => expect(() => totals(10000,16,0)).toThrow());
  it("keeps unknown VAT unresolved", () => expect(totals(900000,12,null).total).toBeNull());
  it("applies confirmed 20% VAT separately", () => expect(totals(900000,12,20).vat).toBe(201600));
  it("calculates two bricklayers four days at £300 plus four labourer days at £200", () => expect(multiplyMoney(30000,8)+multiplyMoney(20000,4)).toBe(320000));
  it("calculates 20m² and 30m² measured floors", () => { expect(floorArea(5,4)).toBe(20);expect(floorArea(6,5)).toBe(30); });
  it("deducts wall openings", () => expect(wallArea(30,2,4)).toBe(56));
  it("calculates concrete cubic metres", () => expect(concreteVolume(5,.6,1)).toBe(3));
  it("rounds sheets with cutting allowance", () => expect(sheetCount(16,2.88,10)).toBe(7));
  it("uses masonry dimensions, joints, leaves and waste", () => expect(masonryUnits(1,215,65,10,1,0)).toBe(60));
  it("uses paint coverage and coats", () => expect(paintLitres(40,2,10,0)).toBe(8));
  for (const [category,l,w] of [["extension",5,4],["extension",6,5],["bathroom",3,2],["kitchen",4,3],["garden_wall",30,1],["plastering",4,4],["knock_through",4,1],["repair",1,1]] as const) {
    it(`does not fabricate a complete ${category} price when essential data is missing (${l}×${w})`, () => {
      const result = calculateEstimate(spec(category,l,w),[],{ markup_percent:12,vat_registered:null,sales_vat_percent:20,tax_confirmed:false });
      expect(result.total).toBeNull();expect(result.status).toBe("review_required");expect(result.missing.length).toBeGreaterThan(0);
    });
  }
  const entries: CatalogEntry[] = [
    {id:"template_repair",kind:"template",name:"Repair",updated_at:"2026-10-31",data:{approved:true,tasks:[{id:"repair",name:"Repair",basis:"count",trade:"builder",productivity:"repair_prod"}]}},
    {id:"builder",kind:"labour",name:"Builder",updated_at:"2026-10-31",data:{pricePence:30000,minimumPence:15000,approved:true,vatTreatment:"not_applicable"}},
    {id:"repair_prod",kind:"productivity",name:"Repair productivity",updated_at:"2026-10-31",data:{approved:true,unitsPerPersonDay:{low:2,expected:4,high:8},minimumPersonDays:0}},
  ];
  it("honours minimum call-out and quantity-driven ranges", () => {
    const r = calculateEstimate(spec("repair"),entries,{markup_percent:12,vat_registered:false,sales_vat_percent:20,tax_confirmed:true});
    expect(r.lines[0]?.cost.expected).toBe(15000);expect(r.total?.expected).toBe(16800);expect(r.lines[0]?.quantity).toEqual({low:.125,expected:.25,high:.5});
  });
  it("revisions recalculate dimensions rather than reuse an old total", () => {
    const e = entries.map(r => r.kind === "template" ? {...r,id:"template_extension",data:{approved:true,tasks:[{id:"floor",name:"Floor",basis:"floor",trade:"builder",productivity:"repair_prod"}]}} : r);
    const settings={markup_percent:12,vat_registered:false,sales_vat_percent:20,tax_confirmed:true};
    expect(calculateEstimate(spec("extension",6,4),e,settings).base.expected).toBe(180000);
    expect(calculateEstimate(spec("extension",5,4),e,settings).base.expected).toBe(150000);
  });
  it("rejects duplicate work phases", () => {
    const e=entries.map(r=>r.kind==="template"?{...r,data:{approved:true,tasks:[{id:"same",basis:"count"},{id:"same",basis:"count"}]}}:r);
    expect(()=>calculateEstimate(spec("repair"),e,{markup_percent:12,vat_registered:false,sales_vat_percent:0,tax_confirmed:true})).toThrow("Duplicate");
  });
});