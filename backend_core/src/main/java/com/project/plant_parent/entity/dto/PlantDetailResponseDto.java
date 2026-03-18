package com.project.plant_parent.entity.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlElementWrapper;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
@JacksonXmlRootElement(localName = "response")
public class PlantDetailResponseDto {
    @JacksonXmlProperty(localName = "header")
    private HeaderDto headerDto;
    @JacksonXmlProperty(localName = "body")
    private BodyDto bodyDto;

    @Getter
    @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class HeaderDto {
        @JacksonXmlProperty(localName = "resultCode")
        private String resultCode;
        @JacksonXmlProperty(localName = "resultMsg")
        private String resultMsg;
        @JacksonXmlProperty(localName = "requestParameter")
        private RequestParameter requestParameter;

        public boolean isSuccess() {
            return "00".equals(resultCode);
        }

    }

    @Getter
    @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class RequestParameter {
        @JacksonXmlProperty(localName = "cntntsNo")
        private int cntntsNo;
    }

    @Getter
    @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class BodyDto {
        @JacksonXmlProperty(localName = "item")
        private ItemDto itemDto;
    }

    @Getter
    @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class ItemDto{

        @JacksonXmlProperty(localName = "adviseInfo")
        private String adviseInfo; // [식용, 지피, 약용, 향기,관엽, 관화, 관실]

        @JacksonXmlProperty(localName = "clCodeNm")//[잎&꽃보기식물,열매보기식물]
        private String clCodeNm;

        @JacksonXmlProperty(localName = "distbNm") // [파스향나무 (추천 유통명: 가울테리아)]
        private String distbNm;

        @JacksonXmlProperty(localName = "dlthtsCodeNm") // [응애,깍지벌레]
        private String dlthtsCodeNm;

        @JacksonXmlProperty(localName = "fncltyInfo") //[진달래과의 작은 관목으로 척박한 산성토양에서 잘 자라며 키는 20cm정도로 포복형이다.  암석정원에 잘 어울린다.]
        private String fncltyInfo;

        @JacksonXmlProperty(localName = "lefStleInfo")
        private String lefStleInfo; // [화려함, 잎의 질감-중간, 잎의 광택-있음, 상록]

        @JacksonXmlProperty(localName = "lighttdemanddoCodeNm")
        private String lighttdemanddoCodeNm; // [중간 광도(800~1,500 Lux),높은 광도(1,500~10,000 Lux)]

        @JacksonXmlProperty(localName = "managedemanddoCodeNm")
        private String managedemanddoCodeNm; // [낮음 (잘 견딤)]

        @JacksonXmlProperty(localName = "orgplceInfo")
        private String orgplceInfo; // [아시아, 아메리카,캐나다]]

        @JacksonXmlProperty(localName = "postngplaceCodeNm")
        private String postngplaceCodeNm; // [거실 창측 (실내깊이 150~300cm),발코니 내측 (실내깊이 50~150cm),발코니 창측 (실내깊이 0~50cm)]

        @JacksonXmlProperty(localName = "prpgtEraInfo")
        private String prpgtEraInfo; // [파종-9~11월/분주-3~5월]

        @JacksonXmlProperty(localName = "soilInfo")
        private String soilInfo; // [토양 : 중성,산성 / 배수 잘 됨 (Loam,Sand)]

        @JacksonXmlProperty(localName = "watercycleSprngCodeNm")
        private String watercycleSprngCodeNm; // [토양 표면이 말랐을때 충분히 관수함]

        @JacksonXmlProperty(localName = "watercycleWinterCodeNm")
        private String watercycleWinterCodeNm; // [화분 흙 대부분 말랐을때 충분히 관수함]

    }
}
